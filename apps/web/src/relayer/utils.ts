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
 * Check Circle Iris V2 API once for message + attestation (non-blocking).
 * Returns null if attestation is not yet complete.
 * V2 uses /v2/messages/{sourceDomainId}?transactionHash={hash}
 */
export async function checkAttestationV2(
  sourceDomain: number,
  txHash: string,
  irisUrl: string,
): Promise<{ message: Hex; attestation: Hex } | null> {
  const url = `${irisUrl}/v2/messages/${sourceDomain}?transactionHash=${encodeURIComponent(
    txHash
  )}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      // 404 is expected until Iris indexes the tx.
      // 429 means we're rate limited.
      if (response.status !== 404 && response.status !== 429) {
        console.warn(`  [IrisV2] Unexpected status ${response.status} for tx ${txHash}`);
      }
      return null;
    }
    if (response.ok) {
      const data = await response.json();
      const msg = data.messages?.[0];
      if (!msg || msg.status !== "complete") {
        return null;
      }
      if (msg && msg.attestation && msg.status === "complete") {
        return {
          message: msg.message as Hex,
          attestation: msg.attestation as Hex,
        };
      }
    }
  } catch {
    // Ignore network errors, will retry next cycle
  }

  return null;
}

/**
 * Poll Circle Iris V2 API for attestation in a tight loop.
 * Checks every `intervalMs` (default 2s) for up to `timeoutMs` (default 10 min).
 * Returns the message + attestation once ready, or throws on timeout.
 */
export async function pollAttestationV2(
  sourceDomain: number,
  txHash: string,
  irisUrl: string,
  label: string,
  intervalMs = 2000,
  timeoutMs = 10 * 60 * 1000,
): Promise<{ message: Hex; attestation: Hex }> {
  const start = Date.now();
  let attempts = 0;

  while (Date.now() - start < timeoutMs) {
    attempts++;
    const result = await checkAttestationV2(sourceDomain, txHash, irisUrl);
    if (result) {
      return result;
    }
    if (attempts % 15 === 0) {
      const elapsed = Math.round((Date.now() - start) / 1000);
      console.log(`  [${label}] Still waiting for attestation... (${elapsed}s elapsed, ${attempts} checks)`);
    }
    await sleep(intervalMs);
  }

  throw new Error(`Attestation timeout after ${timeoutMs / 1000}s for tx ${txHash}`);
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
