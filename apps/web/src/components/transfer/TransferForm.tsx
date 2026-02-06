"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount, useSwitchChain } from "wagmi";
import { parseUnits, isAddress } from "viem";
import { useRouter } from "next/navigation";
import {
  USDC_ADDRESSES,
  TOKEN_MESSENGER_V2,
  ARC_DOMAIN,
  TokenMessengerV2Abi,
  ERC20Abi,
} from "@arc-router/shared";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { pad } from "viem";
import { ChainSelector } from "./ChainSelector";
import { AmountInput } from "./AmountInput";
import { RecipientInput } from "./RecipientInput";
import { FeeEstimate } from "./FeeEstimate";
import { TransferButton } from "./TransferButton";
import { useUsdcBalance } from "@/hooks/useUsdcBalance";
import type { CreateTransferRequest } from "@arc-router/shared";

// Relayer address
const RELAYER_ADDRESS =
  (process.env.NEXT_PUBLIC_RELAYER_ADDRESS as `0x${string}`) ||
  "0x0000000000000000000000000000000000000000";

export function TransferForm() {
  const router = useRouter();
  const { address, chainId: connectedChainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();

  const [sourceChainId, setSourceChainId] = useState<number | null>(84532); // Base Sepolia default
  const [destChainId, setDestChainId] = useState<number | null>(421614); // Arb Sepolia default
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [useSelf, setUseSelf] = useState(true);
  const [step, setStep] = useState<"idle" | "approve" | "burn">("idle");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { balance } = useUsdcBalance(sourceChainId, address);

  // Use sender address as recipient when "send to self"
  useEffect(() => {
    if (useSelf && address) {
      setRecipient(address);
    }
  }, [useSelf, address]);

  // Approval tx
  const {
    writeContract: writeApprove,
    data: approveHash,
    isPending: approvePending,
    error: approveError,
    reset: resetApprove,
  } = useWriteContract();

  const { isSuccess: approveConfirmed } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  // Burn tx
  const {
    writeContract: writeBurn,
    data: burnHash,
    isPending: burnPending,
    error: burnError,
    reset: resetBurn,
  } = useWriteContract();

  const { isSuccess: burnConfirmed } = useWaitForTransactionReceipt({
    hash: burnHash,
  });

  // When approval confirms, move to burn step
  useEffect(() => {
    if (approveConfirmed && step === "approve") {
      setStep("burn");
    }
  }, [approveConfirmed, step]);

  // When burn confirms, submit to API
  useEffect(() => {
    if (burnConfirmed && burnHash && step === "burn" && !submitting) {
      submitToApi(burnHash);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [burnConfirmed, burnHash, step]);

  const submitToApi = async (txHash: string) => {
    if (!address || !sourceChainId || !destChainId) return;
    setSubmitting(true);

    try {
      const body: CreateTransferRequest = {
        sender: address.toLowerCase(),
        recipient: recipient.toLowerCase(),
        sourceChainId,
        destinationChainId: destChainId,
        amount: parseUnits(amount, 6).toString(),
        hop1TxHash: txHash,
      };

      const res = await fetch("/api/transfers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create transfer");
      }

      const transfer = await res.json();
      router.push(`/transfer/${transfer.id}`);
    } catch (e: any) {
      setError(e.message || String(e));
      setSubmitting(false);
    }
  };

  const handleTransfer = async () => {
    setError(null);

    if (!address) {
      setError("Connect your wallet first");
      return;
    }
    if (!sourceChainId || !destChainId) {
      setError("Select source and destination chains");
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      setError("Enter a valid amount");
      return;
    }
    if (!recipient || !isAddress(recipient)) {
      setError("Enter a valid recipient address");
      return;
    }

    try {
      // Switch to source chain if needed
      if (connectedChainId !== sourceChainId) {
        await switchChainAsync({ chainId: sourceChainId });
      }

      const amountBigInt = parseUnits(amount, 6);
      const usdcAddress = USDC_ADDRESSES[sourceChainId];

      if (step === "idle" || step === "approve") {
        // Step 1: Approve
        setStep("approve");
        resetApprove();
        writeApprove({
          address: usdcAddress,
          abi: ERC20Abi,
          functionName: "approve",
          args: [TOKEN_MESSENGER_V2, amountBigInt],
          chainId: sourceChainId,
        });
      } else if (step === "burn") {
        // Step 2: Burn
        const recipientBytes32 = pad(recipient as `0x${string}`, { size: 32 });
        const relayerBytes32 = pad(RELAYER_ADDRESS, { size: 32 });
        resetBurn();
        writeBurn({
          address: TOKEN_MESSENGER_V2,
          abi: TokenMessengerV2Abi,
          functionName: "depositForBurn",
          args: [
            amountBigInt,
            ARC_DOMAIN,
            relayerBytes32,
            usdcAddress,
            "0x0000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`,
            0n,
            1000,
          ],
          chainId: sourceChainId,
        });
      }
    } catch (e: any) {
      setError(e.message || String(e));
    }
  };

  const isLoading =
    approvePending ||
    burnPending ||
    (approveHash && !approveConfirmed && step === "approve") ||
    (burnHash && !burnConfirmed && step === "burn") ||
    submitting;

  const isDisabled = !address || !sourceChainId || !destChainId || !amount || !recipient;

  return (
    <div className="card mx-auto max-w-lg space-y-6">
      <h2 className="text-xl font-bold">Send USDC Cross-Chain</h2>

      <ChainSelector
        label="From"
        selectedChainId={sourceChainId}
        onSelect={(id) => {
          setSourceChainId(id);
          if (id === destChainId) setDestChainId(null);
          setStep("idle");
          resetApprove();
          resetBurn();
        }}
        disabledChainId={destChainId}
      />

      <ChainSelector
        label="To"
        selectedChainId={destChainId}
        onSelect={(id) => {
          setDestChainId(id);
          setStep("idle");
        }}
        disabledChainId={sourceChainId}
      />

      <AmountInput
        value={amount}
        onChange={(v) => {
          setAmount(v);
          setStep("idle");
          resetApprove();
          resetBurn();
        }}
        balance={balance}
        onMax={() => setAmount(balance)}
      />

      <RecipientInput
        value={recipient}
        onChange={setRecipient}
        useSelf={useSelf}
        onToggleSelf={() => {
          setUseSelf(!useSelf);
          if (!useSelf && address) {
            setRecipient(address);
          } else {
            setRecipient("");
          }
        }}
      />

      <FeeEstimate amount={amount} />

      <TransferButton
        onClick={handleTransfer}
        disabled={isDisabled}
        loading={!!isLoading}
        step={step === "idle" ? "approve" : step}
      />

      {(error || approveError || burnError) && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
          {error || approveError?.message || burnError?.message}
        </div>
      )}

      {step === "burn" && !burnHash && (
        <p className="text-center text-sm text-arc-400">
          USDC approved! Now click &quot;Send USDC&quot; to burn and transfer.
        </p>
      )}
    </div>
  );
}
