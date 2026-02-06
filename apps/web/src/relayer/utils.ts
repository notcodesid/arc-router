import { pad, keccak256, type Hex } from "viem";

/**
 * Pad an EVM address to bytes32 for CCTP
 */
export function addressToBytes32(address: `0x${string}`): `0x${string}` {
  return pad(address, { size: 32 });
}

/**
 * Extract message bytes and hash from transaction receipt logs.
 * Looks for the MessageSent event from MessageTransmitterV2.
 */
export function extractMessageFromReceipt(receipt: {
  logs: Array<{ topics: Hex[]; data: Hex }>;
}): { message: Hex; messageHash: Hex } | null {
  // MessageSent event signature: keccak256("MessageSent(bytes)")
  const MESSAGE_SENT_TOPIC =
    "0x8c5261668696ce22758910d05bab8f186d6eb247ceac2af2e82c7dc17669b036" as Hex;

  for (const log of receipt.logs) {
    if (log.topics[0] === MESSAGE_SENT_TOPIC) {
      // ABI-encoded bytes: offset(32) + length(32) + data
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

      const messageHash = keccak256(messageHex);

      return { message: messageHex, messageHash };
    }
  }
  return null;
}

/**
 * Poll Circle Iris API for attestation
 */
export async function pollForAttestation(
  messageHash: Hex,
  irisUrl: string,
  maxAttempts = 120,
  intervalMs = 3000
): Promise<Hex> {
  const url = `${irisUrl}/v2/attestations/${messageHash}`;

  console.log(`    Polling for attestation: ${messageHash}`);

  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        if (
          data.attestation &&
          data.attestation !== "PENDING" &&
          data.status === "complete"
        ) {
          console.log(`    Attestation ready after ${i + 1} attempts`);
          return data.attestation as Hex;
        }
      }
    } catch {
      // Retry on network errors
    }

    if (i % 10 === 0 && i > 0) {
      console.log(`    Still waiting... (attempt ${i + 1}/${maxAttempts})`);
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error(
    `Attestation not ready after ${maxAttempts} attempts for hash ${messageHash}`
  );
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
