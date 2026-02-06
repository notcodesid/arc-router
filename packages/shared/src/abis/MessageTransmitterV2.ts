export const MessageTransmitterV2Abi = [
  {
    type: "function",
    name: "receiveMessage",
    inputs: [
      { name: "message", type: "bytes", internalType: "bytes" },
      { name: "attestation", type: "bytes", internalType: "bytes" },
    ],
    outputs: [{ name: "success", type: "bool", internalType: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "MessageSent",
    inputs: [
      {
        name: "message",
        type: "bytes",
        indexed: false,
        internalType: "bytes",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "MessageReceived",
    inputs: [
      {
        name: "caller",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "sourceDomain",
        type: "uint32",
        indexed: false,
        internalType: "uint32",
      },
      {
        name: "nonce",
        type: "uint64",
        indexed: true,
        internalType: "uint64",
      },
      {
        name: "sender",
        type: "bytes32",
        indexed: false,
        internalType: "bytes32",
      },
      {
        name: "messageBody",
        type: "bytes",
        indexed: false,
        internalType: "bytes",
      },
    ],
    anonymous: false,
  },
] as const;
