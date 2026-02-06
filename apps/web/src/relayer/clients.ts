import {
  createPublicClient,
  createWalletClient,
  http,
  type Chain,
  type PublicClient,
  type WalletClient,
  type Transport,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia, arbitrumSepolia, baseSepolia } from "viem/chains";
import { arcTestnet } from "@arc-router/shared";

const CHAINS: Record<number, Chain> = {
  [sepolia.id]: sepolia,
  [arbitrumSepolia.id]: arbitrumSepolia,
  [baseSepolia.id]: baseSepolia,
  [arcTestnet.id]: arcTestnet,
};

let relayerAccount: ReturnType<typeof privateKeyToAccount> | null = null;

export function getRelayerAccount() {
  if (!relayerAccount) {
    const key = process.env.RELAYER_PRIVATE_KEY;
    if (!key) throw new Error("RELAYER_PRIVATE_KEY not set");
    relayerAccount = privateKeyToAccount(key as `0x${string}`);
  }
  return relayerAccount;
}

const publicClients: Record<number, PublicClient> = {};
const walletClients: Record<number, WalletClient> = {};

export function getPublicClient(chainId: number): PublicClient {
  if (!publicClients[chainId]) {
    const chain = CHAINS[chainId];
    if (!chain) throw new Error(`Unsupported chain: ${chainId}`);
    publicClients[chainId] = createPublicClient({
      chain,
      transport: http(),
    });
  }
  return publicClients[chainId];
}

export function getWalletClient(chainId: number): WalletClient {
  if (!walletClients[chainId]) {
    const chain = CHAINS[chainId];
    if (!chain) throw new Error(`Unsupported chain: ${chainId}`);
    walletClients[chainId] = createWalletClient({
      account: getRelayerAccount(),
      chain,
      transport: http(),
    });
  }
  return walletClients[chainId];
}
