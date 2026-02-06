export const TokenMessengerV2Abi = [
  {
    type: "function",
    name: "depositForBurn",
    inputs: [
      { name: "amount", type: "uint256", internalType: "uint256" },
      { name: "destinationDomain", type: "uint32", internalType: "uint32" },
      { name: "mintRecipient", type: "bytes32", internalType: "bytes32" },
      { name: "burnToken", type: "address", internalType: "address" },
      {
        name: "destinationCaller",
        type: "bytes32",
        internalType: "bytes32",
      },
      { name: "maxFee", type: "uint256", internalType: "uint256" },
      { name: "minFinalityThreshold", type: "uint32", internalType: "uint32" },
    ],
    outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "DepositForBurn",
    inputs: [
      { name: "nonce", type: "uint64", indexed: true, internalType: "uint64" },
      {
        name: "burnToken",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "amount",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "depositor",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "mintRecipient",
        type: "bytes32",
        indexed: false,
        internalType: "bytes32",
      },
      {
        name: "destinationDomain",
        type: "uint32",
        indexed: false,
        internalType: "uint32",
      },
      {
        name: "destinationTokenMessenger",
        type: "bytes32",
        indexed: false,
        internalType: "bytes32",
      },
      {
        name: "destinationCaller",
        type: "bytes32",
        indexed: false,
        internalType: "bytes32",
      },
    ],
    anonymous: false,
  },
] as const;
