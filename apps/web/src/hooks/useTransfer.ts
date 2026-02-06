"use client";

import { useState, useCallback } from "react";
import { parseUnits } from "viem";
import { useAccount, useSwitchChain } from "wagmi";
import { useUsdcApproval } from "./useUsdcApproval";
import { useDepositForBurn } from "./useDepositForBurn";
import type { CreateTransferRequest } from "@arc-router/shared";

type TransferStep = "idle" | "approve" | "burn" | "submitting" | "done";

// Relayer address - in production, fetch from config
const RELAYER_ADDRESS =
  (process.env.NEXT_PUBLIC_RELAYER_ADDRESS as `0x${string}`) ||
  "0x0000000000000000000000000000000000000000";

export function useTransfer() {
  const { address, chainId: connectedChainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();

  const [step, setStep] = useState<TransferStep>("idle");
  const [transferId, setTransferId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const approval = useUsdcApproval(connectedChainId ?? null);
  const burn = useDepositForBurn(connectedChainId ?? null);

  const startTransfer = useCallback(
    async (params: {
      sourceChainId: number;
      destinationChainId: number;
      amount: string;
      recipient: string;
    }) => {
      if (!address) {
        setError("Connect your wallet first");
        return;
      }

      setError(null);
      setTransferId(null);

      try {
        // Ensure correct chain
        if (connectedChainId !== params.sourceChainId) {
          await switchChainAsync({ chainId: params.sourceChainId });
        }

        const amountBigInt = parseUnits(params.amount, 6);

        // Step 1: Approve
        setStep("approve");
        approval.reset();
        approval.approve(amountBigInt);
      } catch (e) {
        setError(String(e));
        setStep("idle");
      }
    },
    [address, connectedChainId, switchChainAsync, approval]
  );

  // Watch for approval success → trigger burn
  const onApprovalSuccess = useCallback(() => {
    if (approval.isSuccess && step === "approve") {
      setStep("burn");
      burn.reset();
      // The amount and recipient need to be passed; we rely on parent re-calling
    }
  }, [approval.isSuccess, step, burn]);

  // Execute burn (called after approval)
  const executeBurn = useCallback(
    (amount: bigint) => {
      burn.depositForBurn(amount, RELAYER_ADDRESS);
    },
    [burn]
  );

  // Submit transfer to API after burn confirmation
  const submitTransfer = useCallback(
    async (params: {
      sourceChainId: number;
      destinationChainId: number;
      amount: string;
      recipient: string;
    }) => {
      if (!burn.hash || !address) return;

      setStep("submitting");

      try {
        const body: CreateTransferRequest = {
          sender: address.toLowerCase(),
          recipient: params.recipient.toLowerCase(),
          sourceChainId: params.sourceChainId,
          destinationChainId: params.destinationChainId,
          amount: parseUnits(params.amount, 6).toString(),
          hop1TxHash: burn.hash,
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
        setTransferId(transfer.id);
        setStep("done");
      } catch (e) {
        setError(String(e));
        setStep("idle");
      }
    },
    [burn.hash, address]
  );

  return {
    step,
    transferId,
    error,
    approval,
    burn,
    startTransfer,
    onApprovalSuccess,
    executeBurn,
    submitTransfer,
    setStep,
    setError,
  };
}
