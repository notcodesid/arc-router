import { TransferStatus } from "@arc-router/shared";
import type { TransferStatus as TransferStatusType } from "@arc-router/shared";

type HookStep = "idle" | "approve" | "burn" | "submitting" | "done";

/**
 * Maps the combination of local hook step and backend transfer status
 * to the animation activeStep (0-4).
 *
 * 0 = Depositing (approve + burn in progress)
 * 1 = Deposited (attesting hop1)
 * 2 = Settling on Arc
 * 3 = Sending (burning on Arc / attesting hop2 / relaying to dest)
 * 4 = Delivered (completed)
 */
export function getActiveStep(
  hookStep: HookStep,
  backendStatus?: TransferStatusType | null
): number {
  // If we have a backend status, use it
  if (backendStatus) {
    switch (backendStatus) {
      case TransferStatus.INITIATED:
      case TransferStatus.ATTESTING_HOP1:
        return 1;
      case TransferStatus.RELAYING_TO_ARC:
      case TransferStatus.SETTLED_ON_ARC:
        return 2;
      case TransferStatus.BURNING_ON_ARC:
      case TransferStatus.ATTESTING_HOP2:
      case TransferStatus.RELAYING_TO_DEST:
        return 3;
      case TransferStatus.COMPLETED:
        return 4;
      case TransferStatus.FAILED:
        return 0;
      default:
        return 0;
    }
  }

  // Local hook steps (before backend tracking)
  switch (hookStep) {
    case "approve":
      return 0;
    case "burn":
      return 0;
    case "submitting":
      return 1;
    case "done":
      return 1;
    default:
      return 0;
  }
}

export function getStatusLabel(
  hookStep: HookStep,
  backendStatus?: TransferStatusType | null
): string {
  if (backendStatus) {
    switch (backendStatus) {
      case TransferStatus.INITIATED:
        return "Transfer initiated...";
      case TransferStatus.ATTESTING_HOP1:
        return "Waiting for attestation...";
      case TransferStatus.RELAYING_TO_ARC:
        return "Relaying to Arc...";
      case TransferStatus.SETTLED_ON_ARC:
        return "Settled on Arc";
      case TransferStatus.BURNING_ON_ARC:
        return "Burning on Arc...";
      case TransferStatus.ATTESTING_HOP2:
        return "Waiting for final attestation...";
      case TransferStatus.RELAYING_TO_DEST:
        return "Relaying to destination...";
      case TransferStatus.COMPLETED:
        return "Transfer complete!";
      case TransferStatus.FAILED:
        return "Transfer failed";
      default:
        return "Processing...";
    }
  }

  switch (hookStep) {
    case "approve":
      return "Approving USDC...";
    case "burn":
      return "Depositing USDC...";
    case "submitting":
      return "Submitting transfer...";
    case "done":
      return "Transfer submitted";
    default:
      return "";
  }
}
