"use client";

export function AddressDisplay({
  address,
  chars = 6,
}: {
  address: string;
  chars?: number;
}) {
  if (!address) return null;

  const truncated = `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;

  return (
    <span className="font-mono text-sm text-gray-400" title={address}>
      {truncated}
    </span>
  );
}
