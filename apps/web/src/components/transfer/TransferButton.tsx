"use client";

interface TransferButtonProps {
  onClick: () => void;
  disabled: boolean;
  loading: boolean;
  step: "approve" | "burn" | "idle";
}

export function TransferButton({
  onClick,
  disabled,
  loading,
  step,
}: TransferButtonProps) {
  const labels = {
    idle: "Start Transfer",
    approve: loading ? "Approving USDC..." : "Approve USDC",
    burn: loading ? "Sending..." : "Send USDC",
  };

  return (
    <button onClick={onClick} disabled={disabled || loading} className="btn-primary w-full text-lg">
      {loading && (
        <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
      )}
      {labels[step]}
    </button>
  );
}
