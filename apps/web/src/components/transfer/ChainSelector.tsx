"use client";

import { CHAIN_NAMES, SUPPORTED_CHAINS } from "@arc-router/shared";
import { ChainLogo } from "../shared/ChainLogo";

interface ChainSelectorProps {
  label: string;
  selectedChainId: number | null;
  onSelect: (chainId: number) => void;
  disabledChainId?: number | null;
}

export function ChainSelector({
  label,
  selectedChainId,
  onSelect,
  disabledChainId,
}: ChainSelectorProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-400">
        {label}
      </label>
      <div className="flex gap-2">
        {SUPPORTED_CHAINS.map((chainId) => {
          const isSelected = selectedChainId === chainId;
          const isDisabled = disabledChainId === chainId;

          return (
            <button
              key={chainId}
              onClick={() => onSelect(chainId)}
              disabled={isDisabled}
              className={`flex items-center gap-2 rounded-xl border px-4 py-3 transition-all ${
                isSelected
                  ? "border-arc-500 bg-arc-600/10 text-white"
                  : isDisabled
                    ? "cursor-not-allowed border-gray-800 bg-gray-900 text-gray-600 opacity-50"
                    : "border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600"
              }`}
            >
              <ChainLogo chainId={chainId} size="sm" />
              <span className="text-sm font-medium">
                {CHAIN_NAMES[chainId]?.replace(" Sepolia", "")}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
