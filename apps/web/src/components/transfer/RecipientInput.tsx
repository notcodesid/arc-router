"use client";

import { isAddress } from "viem";

interface RecipientInputProps {
  value: string;
  onChange: (value: string) => void;
  useSelf?: boolean;
  onToggleSelf?: () => void;
}

export function RecipientInput({
  value,
  onChange,
  useSelf,
  onToggleSelf,
}: RecipientInputProps) {
  const isValid = value === "" || isAddress(value);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="text-sm font-medium text-gray-400">Recipient</label>
        {onToggleSelf && (
          <button
            onClick={onToggleSelf}
            className="text-xs text-arc-400 hover:text-arc-300"
          >
            {useSelf ? "Enter address" : "Send to self"}
          </button>
        )}
      </div>
      <input
        type="text"
        placeholder="0x..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={useSelf}
        className={`input font-mono text-sm ${
          !isValid ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
        } ${useSelf ? "opacity-50" : ""}`}
      />
      {!isValid && (
        <p className="mt-1 text-xs text-red-400">Invalid Ethereum address</p>
      )}
    </div>
  );
}
