import { pad, type Hex } from "viem";
import { IRIS_API_URL } from "@arc-router/shared";

/**
 * Pad an EVM address to bytes32 for CCTP
 */
export function addressToBytes32(address: `0x${string}`): `0x${string}` {
  return pad(address, { size: 32 });
}

/**
 * Extract message bytes from a MessageSent event log
 */
export function extractMessageFromLogs(
  logs: Array<{ topics: Hex[]; data: Hex }>,
  messageTransmitterAddress: `0x${string}`
): { message: Hex; messageHash: Hex } | null {
  // MessageSent event topic
  const MESSAGE_SENT_TOPIC =
    "0x8c5261668696ce22758910d05bab8f186d6eb247ceac2af2e82c7dc17669b036";

  for (const log of logs) {
    if (log.topics[0] === MESSAGE_SENT_TOPIC) {
      // The message is the first (and only) non-indexed param, so it's in data
      // ABI decode: bytes offset (32 bytes) + length (32 bytes) + message data
      const dataWithoutPrefix = log.data.slice(2);
      const offset = parseInt(dataWithoutPrefix.slice(0, 64), 16);
      const length = parseInt(
        dataWithoutPrefix.slice(offset * 2, offset * 2 + 64),
        16
      );
      const messageHex = `0x${dataWithoutPrefix.slice(
        offset * 2 + 64,
        offset * 2 + 64 + length * 2
      )}` as Hex;

      // Message hash is keccak256 of the message bytes
      const { keccak256 } = require("viem");
      const messageHash = keccak256(messageHex) as Hex;

      return { message: messageHex, messageHash };
    }
  }
  return null;
}

/**
 * Poll Circle's Iris attestation API until attestation is ready
 */
export async function pollForAttestation(
  messageHash: Hex,
  maxAttempts = 60,
  intervalMs = 3000
): Promise<{ attestation: Hex; status: string }> {
  const url = `${IRIS_API_URL}/v2/attestations/${messageHash}`;

  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        if (data.attestation && data.attestation !== "PENDING") {
          return {
            attestation: data.attestation as Hex,
            status: "complete",
          };
        }
      }
    } catch {
      // Retry on network errors
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error(
    `Attestation not ready after ${maxAttempts} attempts for hash ${messageHash}`
  );
}
