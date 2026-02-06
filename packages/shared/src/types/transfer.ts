export const TransferStatus = {
  INITIATED: "INITIATED",
  ATTESTING_HOP1: "ATTESTING_HOP1",
  RELAYING_TO_ARC: "RELAYING_TO_ARC",
  SETTLED_ON_ARC: "SETTLED_ON_ARC",
  BURNING_ON_ARC: "BURNING_ON_ARC",
  ATTESTING_HOP2: "ATTESTING_HOP2",
  RELAYING_TO_DEST: "RELAYING_TO_DEST",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
} as const;

export type TransferStatus =
  (typeof TransferStatus)[keyof typeof TransferStatus];

export const TRANSFER_STATUS_ORDER: TransferStatus[] = [
  TransferStatus.INITIATED,
  TransferStatus.ATTESTING_HOP1,
  TransferStatus.RELAYING_TO_ARC,
  TransferStatus.SETTLED_ON_ARC,
  TransferStatus.BURNING_ON_ARC,
  TransferStatus.ATTESTING_HOP2,
  TransferStatus.RELAYING_TO_DEST,
  TransferStatus.COMPLETED,
];

export interface Transfer {
  id: string;
  createdAt: string;
  updatedAt: string;
  sender: string;
  recipient: string;
  sourceChainId: number;
  destinationChainId: number;
  sourceDomain: number;
  destinationDomain: number;
  amount: string;
  status: TransferStatus;
  error: string | null;
  hop1TxHash: string | null;
  hop1Attestation: string | null;
  hop1Message: string | null;
  hop1RelayTxHash: string | null;
  hop2TxHash: string | null;
  hop2Attestation: string | null;
  hop2Message: string | null;
  hop2RelayTxHash: string | null;
  completedAt: string | null;
}

export interface CreateTransferRequest {
  sender: string;
  recipient: string;
  sourceChainId: number;
  destinationChainId: number;
  amount: string;
  hop1TxHash: string;
}
