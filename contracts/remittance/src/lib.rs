#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short,
    contracterror,
    Address, Env, String, Vec,
    log,
};

// ─── Error Codes ────────────────────────────────────────────────────────────
#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum RemittanceError {
    InsufficientFunds     = 1,
    SlippageExceeded      = 2,
    UnsupportedCorridor   = 3,
    InvalidAmount         = 4,
    Unauthorized          = 5,
    InvalidAddress        = 6,
}

// ─── Data Types ─────────────────────────────────────────────────────────────
#[contracttype]
#[derive(Clone, Debug)]
pub struct Transaction {
    pub id:              u64,
    pub sender:          Address,
    pub recipient:       Address,
    pub amount_sent:     i128,
    pub amount_received: i128,
    pub source_asset:    String,
    pub dest_asset:      String,
    pub status:          String,
    pub timestamp:       u64,
    pub tx_hash:         String,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct Corridor {
    pub source_asset: String,
    pub dest_asset:   String,
    pub rate:         i128,   // rate * 1_000_000 (6 decimals)
    pub fee_bps:      u32,    // basis points e.g. 30 = 0.3%
    pub active:       bool,
}

#[contracttype]
pub enum DataKey {
    TxCounter,
    Transaction(u64),
    UserTxList(Address),
    Corridor(String, String),
    Admin,
}

// ─── Contract ────────────────────────────────────────────────────────────────
#[contract]
pub struct RemittanceContract;

#[contractimpl]
impl RemittanceContract {

    // ── Initialize ──────────────────────────────────────────────────────────
    pub fn initialize(env: Env, admin: Address) -> Result<(), RemittanceError> {
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(RemittanceError::Unauthorized);
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::TxCounter, &0u64);

        // Seed default corridors
        Self::add_corridor(&env,
            String::from_str(&env, "USDC"),
            String::from_str(&env, "EURC"),
            920_000i128, 30u32);
        Self::add_corridor(&env,
            String::from_str(&env, "USDC"),
            String::from_str(&env, "BRLT"),
            4_950_000i128, 50u32);
        Self::add_corridor(&env,
            String::from_str(&env, "USDC"),
            String::from_str(&env, "NGNT"),
            1_580_000_000i128, 80u32);
        Self::add_corridor(&env,
            String::from_str(&env, "XLM"),
            String::from_str(&env, "USDC"),
            110_000i128, 20u32);
        Self::add_corridor(&env,
            String::from_str(&env, "XLM"),
            String::from_str(&env, "EURC"),
            101_000i128, 25u32);

        Ok(())
    }

    fn add_corridor(env: &Env, src: String, dst: String, rate: i128, fee_bps: u32) {
        let corridor = Corridor {
            source_asset: src.clone(),
            dest_asset:   dst.clone(),
            rate,
            fee_bps,
            active: true,
        };
        env.storage().persistent().set(
            &DataKey::Corridor(src, dst),
            &corridor,
        );
    }

    // ── Send Remittance ─────────────────────────────────────────────────────
    pub fn send_remittance(
        env:                Env,
        sender:             Address,
        recipient:          Address,
        amount:             i128,
        source_asset:       String,
        dest_asset:         String,
        slippage_tolerance: u32,
    ) -> Result<Transaction, RemittanceError> {
        sender.require_auth();

        if amount <= 0 {
            return Err(RemittanceError::InvalidAmount);
        }

        // Validate corridor
        let corridor = env.storage().persistent()
            .get::<DataKey, Corridor>(&DataKey::Corridor(source_asset.clone(), dest_asset.clone()))
            .ok_or(RemittanceError::UnsupportedCorridor)?;

        if !corridor.active {
            return Err(RemittanceError::UnsupportedCorridor);
        }

        // Calculate received amount
        let fee_amount = amount * corridor.fee_bps as i128 / 10_000;
        let net_amount = amount - fee_amount;
        let amount_received = net_amount * corridor.rate / 1_000_000;

        // Slippage check
        let expected = amount * corridor.rate / 1_000_000;
        let min_received = expected * (10_000 - slippage_tolerance as i128) / 10_000;
        if amount_received < min_received {
            return Err(RemittanceError::SlippageExceeded);
        }

        // Increment tx counter
        let tx_id: u64 = env.storage().instance()
            .get(&DataKey::TxCounter)
            .unwrap_or(0u64) + 1;
        env.storage().instance().set(&DataKey::TxCounter, &tx_id);

        let tx_hash = String::from_str(&env, "testnet_tx_hash");

        let tx = Transaction {
            id: tx_id,
            sender: sender.clone(),
            recipient: recipient.clone(),
            amount_sent: amount,
            amount_received,
            source_asset: source_asset.clone(),
            dest_asset: dest_asset.clone(),
            status: String::from_str(&env, "completed"),
            timestamp: env.ledger().timestamp(),
            tx_hash,
        };

        // Persist transaction
        env.storage().persistent().set(&DataKey::Transaction(tx_id), &tx);

        // Update user tx list
        let mut user_txs: Vec<u64> = env.storage().persistent()
            .get(&DataKey::UserTxList(sender.clone()))
            .unwrap_or_else(|| Vec::new(&env));
        user_txs.push_back(tx_id);
        env.storage().persistent().set(&DataKey::UserTxList(sender.clone()), &user_txs);

        // Emit event
        env.events().publish(
            (symbol_short!("remit"), symbol_short!("sent")),
            (sender.clone(), recipient.clone(), amount, source_asset, dest_asset, amount_received),
        );

        log!(&env, "Remittance sent: amount={}", amount);

        Ok(tx)
    }

    // ── Get Transaction History ─────────────────────────────────────────────
    pub fn get_transaction_history(env: Env, address: Address) -> Vec<Transaction> {
        let tx_ids: Vec<u64> = env.storage().persistent()
            .get(&DataKey::UserTxList(address))
            .unwrap_or_else(|| Vec::new(&env));

        let mut txs: Vec<Transaction> = Vec::new(&env);
        let len = tx_ids.len();
        let start = if len > 20 { len - 20 } else { 0 };
        for i in start..len {
            let id = tx_ids.get(i).unwrap();
            if let Some(tx) = env.storage().persistent().get(&DataKey::Transaction(id)) {
                txs.push_back(tx);
            }
        }
        txs
    }

    // ── Get Exchange Rate ───────────────────────────────────────────────────
    pub fn get_exchange_rate(
        env:          Env,
        source_asset: String,
        dest_asset:   String,
    ) -> Result<i128, RemittanceError> {
        let corridor = env.storage().persistent()
            .get::<DataKey, Corridor>(&DataKey::Corridor(source_asset, dest_asset))
            .ok_or(RemittanceError::UnsupportedCorridor)?;
        Ok(corridor.rate)
    }

    // ── Update Rate (admin only) ────────────────────────────────────────────
    pub fn update_rate(
        env:          Env,
        admin:        Address,
        source_asset: String,
        dest_asset:   String,
        new_rate:     i128,
    ) -> Result<(), RemittanceError> {
        admin.require_auth();
        let stored_admin: Address = env.storage().instance()
            .get(&DataKey::Admin)
            .ok_or(RemittanceError::Unauthorized)?;
        if admin != stored_admin {
            return Err(RemittanceError::Unauthorized);
        }
        let mut corridor = env.storage().persistent()
            .get::<DataKey, Corridor>(&DataKey::Corridor(source_asset.clone(), dest_asset.clone()))
            .ok_or(RemittanceError::UnsupportedCorridor)?;
        corridor.rate = new_rate;
        env.storage().persistent().set(
            &DataKey::Corridor(source_asset, dest_asset),
            &corridor,
        );
        Ok(())
    }

    // ── Get Transaction by ID ───────────────────────────────────────────────
    pub fn get_transaction(env: Env, tx_id: u64) -> Option<Transaction> {
        env.storage().persistent().get(&DataKey::Transaction(tx_id))
    }

    // ── Get TX Counter ──────────────────────────────────────────────────────
    pub fn get_tx_count(env: Env) -> u64 {
        env.storage().instance().get(&DataKey::TxCounter).unwrap_or(0)
    }
}

mod test;
