"use client";

export function FeeEstimate({ amount }: { amount: string }) {
  if (!amount || parseFloat(amount) === 0) return null;

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500">Route</span>
        <span className="text-gray-300">Source → Arc L1 → Destination</span>
      </div>
      <div className="mt-2 flex items-center justify-between text-sm">
        <span className="text-gray-500">Estimated time</span>
        <span className="text-gray-300">~20-40 seconds</span>
      </div>
      <div className="mt-2 flex items-center justify-between text-sm">
        <span className="text-gray-500">Protocol fee</span>
        <span className="text-green-400">Free (testnet)</span>
      </div>
      <div className="mt-2 flex items-center justify-between text-sm">
        <span className="text-gray-500">You receive</span>
        <span className="font-medium text-white">{amount} USDC</span>
      </div>
    </div>
  );
}
