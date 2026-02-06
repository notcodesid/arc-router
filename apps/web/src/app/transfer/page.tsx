import { TransferForm } from "@/components/transfer/TransferForm";

export default function TransferPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Transfer USDC</h1>
        <p className="mt-2 text-gray-500">
          Send USDC across chains via Arc L1 in seconds
        </p>
      </div>
      <TransferForm />
    </div>
  );
}
