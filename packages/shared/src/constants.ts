// CCTP V2 Contract Addresses (same on all chains)
export const TOKEN_MESSENGER_V2 =
  "0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA" as const;

// MessageTransmitterV2 addresses per chain
export const MESSAGE_TRANSMITTER_V2: Record<number, `0x${string}`> = {
  11155111: "0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275", // Ethereum Sepolia
  421614: "0xaCF1ceeF35caAc005e15888dDb8A3515C41B4872", // Arbitrum Sepolia
  84532: "0x7865fAfC2db2093669d92c0F33AeEF291086BEFD", // Base Sepolia
  5042002: "0x7865fAfC2db2093669d92c0F33AeEF291086BEFD", // Arc Testnet
};

// USDC addresses per chain
export const USDC_ADDRESSES: Record<number, `0x${string}`> = {
  11155111: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", // Ethereum Sepolia
  421614: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d", // Arbitrum Sepolia
  84532: "0x036CbD53842c5426634e7929541eC2318f3dCF7e", // Base Sepolia
  5042002: "0x3600000000000000000000000000000000000000", // Arc Testnet
};

// CCTP Domain IDs
export const CCTP_DOMAINS: Record<number, number> = {
  11155111: 0, // Ethereum Sepolia
  421614: 3, // Arbitrum Sepolia
  84532: 6, // Base Sepolia
  5042002: 26, // Arc Testnet
};

// Reverse: domain → chainId
export const DOMAIN_TO_CHAIN_ID: Record<number, number> = {
  0: 11155111,
  3: 421614,
  6: 84532,
  26: 5042002,
};

// Chain display names
export const CHAIN_NAMES: Record<number, string> = {
  11155111: "Ethereum Sepolia",
  421614: "Arbitrum Sepolia",
  84532: "Base Sepolia",
  5042002: "Arc Testnet",
};

// Arc domain
export const ARC_DOMAIN = 26;
export const ARC_CHAIN_ID = 5042002;

// Iris API
export const IRIS_API_URL = "https://iris-api-sandbox.circle.com";

// Supported source/destination chains (not Arc)
export const SUPPORTED_CHAINS = [11155111, 421614, 84532] as const;
