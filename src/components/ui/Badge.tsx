import { HTMLAttributes } from "react";
import { clsx } from "clsx";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "green" | "orange" | "red" | "gray";
}

export default function Badge({ variant = "gray", className, children, ...props }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
        {
          "bg-accent-green/20 text-accent-green": variant === "green",
          "bg-accent-orange/20 text-accent-orange": variant === "orange",
          "bg-red-500/20 text-red-400": variant === "red",
          "bg-white/10 text-text-secondary": variant === "gray",
        },
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
