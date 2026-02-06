"use client";

import { CHAIN_NAMES } from "@arc-router/shared";

const CHAIN_COLORS: Record<number, string> = {
  11155111: "bg-blue-500",
  421614: "bg-sky-400",
  84532: "bg-blue-600",
  5042002: "bg-arc-500",
};

const CHAIN_LETTERS: Record<number, string> = {
  11155111: "E",
  421614: "A",
  84532: "B",
  5042002: "R",
};

export function ChainLogo({
  chainId,
  size = "md",
}: {
  chainId: number;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses = {
    sm: "h-6 w-6 text-xs",
    md: "h-8 w-8 text-sm",
    lg: "h-10 w-10 text-base",
  };

  return (
    <div
      className={`flex items-center justify-center rounded-full font-bold text-white ${
        CHAIN_COLORS[chainId] || "bg-gray-500"
      } ${sizeClasses[size]}`}
      title={CHAIN_NAMES[chainId] || `Chain ${chainId}`}
    >
      {CHAIN_LETTERS[chainId] || "?"}
    </div>
  );
}
