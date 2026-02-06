import { type Chain } from "viem";

export const arcTestnet: Chain = {
  id: 5042002,
  name: "Arc Testnet",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc-testnet.arc.money"],
    },
  },
  blockExplorers: {
    default: {
      name: "Arc Explorer",
      url: "https://explorer-testnet.arc.money",
    },
  },
  testnet: true,
};
