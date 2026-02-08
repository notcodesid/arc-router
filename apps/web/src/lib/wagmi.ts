import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import { sepolia, arbitrumSepolia, baseSepolia } from "wagmi/chains";
import { arcTestnet } from "@arc-router/shared";

export const config = getDefaultConfig({
  appName: "Arc Router",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "",
  chains: [baseSepolia, arbitrumSepolia, sepolia, arcTestnet],
  transports: {
    [baseSepolia.id]: http(),
    [arbitrumSepolia.id]: http(),
    [sepolia.id]: http(),
    [arcTestnet.id]: http(),
  },
  ssr: true,
});
