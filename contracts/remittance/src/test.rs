#![cfg(test)]

use super::*;
use soroban_sdk::{
    testutils::{Address as _, Ledger},
    Address, Env, String,
};

#[test]
fn test_initialize() {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let contract_id = env.register_contract(None, RemittanceContract);
    let client = RemittanceContractClient::new(&env, &contract_id);
    client.initialize(&admin);
    // Should not panic
}

#[test]
fn test_double_initialize_fails() {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let contract_id = env.register_contract(None, RemittanceContract);
    let client = RemittanceContractClient::new(&env, &contract_id);
    client.initialize(&admin);
    let result = client.try_initialize(&admin);
    assert!(result.is_err());
}

#[test]
fn test_send_remittance_usdc_to_eurc() {
    let env = Env::default();
    env.mock_all_auths();
    env.ledger().with_mut(|l| l.timestamp = 1_700_000_000);

    let admin     = Address::generate(&env);
    let sender    = Address::generate(&env);
    let recipient = Address::generate(&env);

    let contract_id = env.register_contract(None, RemittanceContract);
    let client = RemittanceContractClient::new(&env, &contract_id);
    client.initialize(&admin);

    let tx = client.send_remittance(
        &sender,
        &recipient,
        &1_000_000i128,
        &String::from_str(&env, "USDC"),
        &String::from_str(&env, "EURC"),
        &50u32,
    );

    assert_eq!(tx.sender, sender);
    assert_eq!(tx.recipient, recipient);
    assert_eq!(tx.amount_sent, 1_000_000i128);
    // fee = 1_000_000 * 30 / 10_000 = 3_000
    // net = 997_000
    // received = 997_000 * 920_000 / 1_000_000 = 917_240
    assert_eq!(tx.amount_received, 917_240i128);
}

#[test]
fn test_send_remittance_usdc_to_brlt() {
    let env = Env::default();
    env.mock_all_auths();
    env.ledger().with_mut(|l| l.timestamp = 1_700_000_000);

    let admin     = Address::generate(&env);
    let sender    = Address::generate(&env);
    let recipient = Address::generate(&env);

    let contract_id = env.register_contract(None, RemittanceContract);
    let client = RemittanceContractClient::new(&env, &contract_id);
    client.initialize(&admin);

    let tx = client.send_remittance(
        &sender,
        &recipient,
        &1_000_000i128,
        &String::from_str(&env, "USDC"),
        &String::from_str(&env, "BRLT"),
        &100u32,
    );

    assert!(tx.amount_received > 0);
}

#[test]
fn test_unsupported_corridor_returns_error() {
    let env = Env::default();
    env.mock_all_auths();

    let admin     = Address::generate(&env);
    let sender    = Address::generate(&env);
    let recipient = Address::generate(&env);

    let contract_id = env.register_contract(None, RemittanceContract);
    let client = RemittanceContractClient::new(&env, &contract_id);
    client.initialize(&admin);

    let result = client.try_send_remittance(
        &sender,
        &recipient,
        &1_000_000i128,
        &String::from_str(&env, "BTC"),
        &String::from_str(&env, "ETH"),
        &50u32,
    );
    assert!(result.is_err());
}

#[test]
fn test_invalid_amount_returns_error() {
    let env = Env::default();
    env.mock_all_auths();

    let admin     = Address::generate(&env);
    let sender    = Address::generate(&env);
    let recipient = Address::generate(&env);

    let contract_id = env.register_contract(None, RemittanceContract);
    let client = RemittanceContractClient::new(&env, &contract_id);
    client.initialize(&admin);

    let result = client.try_send_remittance(
        &sender,
        &recipient,
        &0i128,
        &String::from_str(&env, "USDC"),
        &String::from_str(&env, "EURC"),
        &50u32,
    );
    assert!(result.is_err());
}

#[test]
fn test_get_exchange_rate() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let contract_id = env.register_contract(None, RemittanceContract);
    let client = RemittanceContractClient::new(&env, &contract_id);
    client.initialize(&admin);

    let rate = client.get_exchange_rate(
        &String::from_str(&env, "USDC"),
        &String::from_str(&env, "EURC"),
    );
    assert_eq!(rate, 920_000i128);
}

#[test]
fn test_get_tx_count_increments() {
    let env = Env::default();
    env.mock_all_auths();
    env.ledger().with_mut(|l| l.timestamp = 1_700_000_000);

    let admin     = Address::generate(&env);
    let sender    = Address::generate(&env);
    let recipient = Address::generate(&env);

    let contract_id = env.register_contract(None, RemittanceContract);
    let client = RemittanceContractClient::new(&env, &contract_id);
    client.initialize(&admin);

    assert_eq!(client.get_tx_count(), 0u64);

    client.send_remittance(
        &sender, &recipient, &1_000_000i128,
        &String::from_str(&env, "USDC"),
        &String::from_str(&env, "EURC"),
        &50u32,
    );
    assert_eq!(client.get_tx_count(), 1u64);

    client.send_remittance(
        &sender, &recipient, &2_000_000i128,
        &String::from_str(&env, "USDC"),
        &String::from_str(&env, "BRLT"),
        &100u32,
    );
    assert_eq!(client.get_tx_count(), 2u64);
}

#[test]
fn test_transaction_history() {
    let env = Env::default();
    env.mock_all_auths();
    env.ledger().with_mut(|l| l.timestamp = 1_700_000_000);

    let admin     = Address::generate(&env);
    let sender    = Address::generate(&env);
    let recipient = Address::generate(&env);

    let contract_id = env.register_contract(None, RemittanceContract);
    let client = RemittanceContractClient::new(&env, &contract_id);
    client.initialize(&admin);

    client.send_remittance(
        &sender, &recipient, &1_000_000i128,
        &String::from_str(&env, "USDC"),
        &String::from_str(&env, "EURC"),
        &50u32,
    );

    let history = client.get_transaction_history(&sender);
    assert_eq!(history.len(), 1);
    assert_eq!(history.get(0).unwrap().amount_sent, 1_000_000i128);
}

#[test]
fn test_update_rate_by_admin() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let contract_id = env.register_contract(None, RemittanceContract);
    let client = RemittanceContractClient::new(&env, &contract_id);
    client.initialize(&admin);

    client.update_rate(
        &admin,
        &String::from_str(&env, "USDC"),
        &String::from_str(&env, "EURC"),
        &950_000i128,
    );

    let rate = client.get_exchange_rate(
        &String::from_str(&env, "USDC"),
        &String::from_str(&env, "EURC"),
    );
    assert_eq!(rate, 950_000i128);
}

#[test]
fn test_get_transaction_by_id() {
    let env = Env::default();
    env.mock_all_auths();
    env.ledger().with_mut(|l| l.timestamp = 1_700_000_000);

    let admin     = Address::generate(&env);
    let sender    = Address::generate(&env);
    let recipient = Address::generate(&env);

    let contract_id = env.register_contract(None, RemittanceContract);
    let client = RemittanceContractClient::new(&env, &contract_id);
    client.initialize(&admin);

    let tx = client.send_remittance(
        &sender, &recipient, &5_000_000i128,
        &String::from_str(&env, "USDC"),
        &String::from_str(&env, "NGNT"),
        &200u32,
    );

    let fetched = client.get_transaction(&tx.id);
    assert!(fetched.is_some());
    assert_eq!(fetched.unwrap().id, tx.id);
}
