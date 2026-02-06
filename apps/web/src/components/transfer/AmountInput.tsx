"use client";

interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
  balance?: string;
  onMax?: () => void;
}

export function AmountInput({
  value,
  onChange,
  balance,
  onMax,
}: AmountInputProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-400">
        Amount (USDC)
      </label>
      <div className="relative">
        <input
          type="text"
          inputMode="decimal"
          placeholder="0.00"
          value={value}
          onChange={(e) => {
            const val = e.target.value;
            // Allow only valid decimal input
            if (val === "" || /^\d*\.?\d{0,6}$/.test(val)) {
              onChange(val);
            }
          }}
          className="input pr-20 text-xl"
        />
        <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2">
          <span className="text-sm font-semibold text-gray-500">USDC</span>
          {onMax && balance && (
            <button
              onClick={onMax}
              className="rounded bg-arc-600/20 px-2 py-0.5 text-xs font-medium text-arc-400 hover:bg-arc-600/30"
            >
              MAX
            </button>
          )}
        </div>
      </div>
      {balance && (
        <p className="mt-1 text-xs text-gray-600">
          Balance: {balance} USDC
        </p>
      )}
    </div>
  );
}
