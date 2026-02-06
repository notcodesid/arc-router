"use client";

import {
  TransferStatus,
  TRANSFER_STATUS_ORDER,
  CHAIN_NAMES,
  type Transfer,
} from "@arc-router/shared";
import { StatusBadge } from "./StatusBadge";
import { AddressDisplay } from "../shared/AddressDisplay";
import { ChainLogo } from "../shared/ChainLogo";

const STEP_LABELS: Record<string, string> = {
  [TransferStatus.INITIATED]: "Transfer Initiated",
  [TransferStatus.ATTESTING_HOP1]: "Waiting for Source Attestation",
  [TransferStatus.RELAYING_TO_ARC]: "Relaying to Arc L1",
  [TransferStatus.SETTLED_ON_ARC]: "Settled on Arc",
  [TransferStatus.BURNING_ON_ARC]: "Routing via Arc",
  [TransferStatus.ATTESTING_HOP2]: "Waiting for Arc Attestation",
  [TransferStatus.RELAYING_TO_DEST]: "Relaying to Destination",
  [TransferStatus.COMPLETED]: "Transfer Complete",
};

export function TransferProgress({ transfer }: { transfer: Transfer }) {
  const currentIndex = TRANSFER_STATUS_ORDER.indexOf(
    transfer.status as TransferStatus
  );
  const isFailed = transfer.status === TransferStatus.FAILED;

  // Format amount for display
  const amountDisplay = (parseInt(transfer.amount) / 1e6).toFixed(2);

  return (
    <div className="card mx-auto max-w-lg space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Transfer Status</h2>
        <StatusBadge status={transfer.status} />
      </div>

      {/* Transfer summary */}
      <div className="flex items-center justify-between rounded-xl border border-gray-800 bg-gray-900/50 p-4">
        <div className="flex items-center gap-3">
          <ChainLogo chainId={transfer.sourceChainId} />
          <div>
            <p className="text-sm text-gray-500">From</p>
            <p className="text-sm font-medium">
              {CHAIN_NAMES[transfer.sourceChainId]}
            </p>
          </div>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold">{amountDisplay}</p>
          <p className="text-xs text-gray-500">USDC</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm text-gray-500">To</p>
            <p className="text-sm font-medium">
              {CHAIN_NAMES[transfer.destinationChainId]}
            </p>
          </div>
          <ChainLogo chainId={transfer.destinationChainId} />
        </div>
      </div>

      {/* Progress steps */}
      <div className="space-y-1">
        {TRANSFER_STATUS_ORDER.map((status, index) => {
          const isActive = index === currentIndex && !isFailed;
          const isCompleted = index < currentIndex;
          const isFutureStep = index > currentIndex;

          return (
            <div
              key={status}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
                isActive
                  ? "bg-arc-600/10"
                  : isCompleted
                    ? "opacity-80"
                    : "opacity-40"
              }`}
            >
              <div
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  isCompleted
                    ? "bg-green-500 text-white"
                    : isActive
                      ? "bg-arc-500 text-white"
                      : "border border-gray-600 text-gray-600"
                }`}
              >
                {isCompleted ? "\u2713" : index + 1}
              </div>
              <span
                className={`text-sm ${
                  isActive
                    ? "font-medium text-white"
                    : isCompleted
                      ? "text-gray-400"
                      : "text-gray-600"
                }`}
              >
                {STEP_LABELS[status]}
              </span>
              {isActive && (
                <span className="ml-auto h-2 w-2 animate-pulse rounded-full bg-arc-400" />
              )}
            </div>
          );
        })}
      </div>

      {/* Error message */}
      {isFailed && transfer.error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
          {transfer.error}
        </div>
      )}

      {/* Transaction details */}
      <div className="space-y-2 text-sm">
        <p className="font-medium text-gray-400">Details</p>
        <div className="flex justify-between">
          <span className="text-gray-500">Sender</span>
          <AddressDisplay address={transfer.sender} />
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Recipient</span>
          <AddressDisplay address={transfer.recipient} />
        </div>
        {transfer.hop1TxHash && (
          <div className="flex justify-between">
            <span className="text-gray-500">Hop 1 TX</span>
            <AddressDisplay address={transfer.hop1TxHash} />
          </div>
        )}
        {transfer.hop1RelayTxHash && (
          <div className="flex justify-between">
            <span className="text-gray-500">Arc Relay TX</span>
            <AddressDisplay address={transfer.hop1RelayTxHash} />
          </div>
        )}
        {transfer.hop2TxHash && (
          <div className="flex justify-between">
            <span className="text-gray-500">Hop 2 TX</span>
            <AddressDisplay address={transfer.hop2TxHash} />
          </div>
        )}
        {transfer.hop2RelayTxHash && (
          <div className="flex justify-between">
            <span className="text-gray-500">Dest Relay TX</span>
            <AddressDisplay address={transfer.hop2RelayTxHash} />
          </div>
        )}
      </div>

      {transfer.status === TransferStatus.COMPLETED && (
        <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-center text-sm text-green-400">
          Transfer complete! {amountDisplay} USDC delivered to{" "}
          {CHAIN_NAMES[transfer.destinationChainId]}.
        </div>
      )}
    </div>
  );
}
