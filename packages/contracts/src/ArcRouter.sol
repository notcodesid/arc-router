// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IERC20 {
    function approve(address spender, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

interface ITokenMessengerV2 {
    function depositForBurn(
        uint256 amount,
        uint32 destinationDomain,
        bytes32 mintRecipient,
        address burnToken,
        bytes32 destinationCaller,
        uint256 maxFee,
        uint32 minFinalityThreshold
    ) external;
}

/**
 * @title ArcRouter
 * @notice Routes USDC transfers through Arc L1 using CCTP V2.
 *         Deployed on Arc Testnet. Called by the relayer after hop1 settlement.
 *         Approves TokenMessengerV2, calls depositForBurn to destination chain.
 */
contract ArcRouter {
    address public owner;
    address public relayer;
    ITokenMessengerV2 public immutable tokenMessenger;
    IERC20 public immutable usdc;

    event TransferRouted(
        bytes32 indexed transferId,
        uint256 amount,
        uint32 destinationDomain,
        bytes32 recipient
    );

    event RelayerUpdated(address indexed oldRelayer, address indexed newRelayer);

    error OnlyRelayer();
    error OnlyOwner();
    error InsufficientBalance();

    modifier onlyRelayer() {
        _onlyRelayer();
        _;
    }

    modifier onlyOwner() {
        _onlyOwner();
        _;
    }

    function _onlyRelayer() internal view {
        if (msg.sender != relayer) revert OnlyRelayer();
    }

    function _onlyOwner() internal view {
        if (msg.sender != owner) revert OnlyOwner();
    }

    constructor(
        address _tokenMessenger,
        address _usdc,
        address _relayer
    ) {
        owner = msg.sender;
        tokenMessenger = ITokenMessengerV2(_tokenMessenger);
        usdc = IERC20(_usdc);
        relayer = _relayer;
    }

    /**
     * @notice Route a transfer from Arc to the destination chain via CCTP V2
     * @param transferId Unique transfer identifier for tracking
     * @param amount Amount of USDC to route (6 decimals)
     * @param destinationDomain CCTP domain of destination chain
     * @param recipient Recipient address padded to bytes32
     */
    function routeTransfer(
        bytes32 transferId,
        uint256 amount,
        uint32 destinationDomain,
        bytes32 recipient
    ) external onlyRelayer {
        if (usdc.balanceOf(address(this)) < amount) revert InsufficientBalance();

        // Approve TokenMessengerV2 to spend USDC
        require(usdc.approve(address(tokenMessenger), amount), "USDC_APPROVE_FAILED");

        // Burn USDC and send to destination chain
        tokenMessenger.depositForBurn(
            amount,
            destinationDomain,
            recipient,
            address(usdc),
            bytes32(0), // no destination caller restriction
            0,          // maxFee = 0 (free for Standard Transfer)
            2000        // minFinalityThreshold for Standard Transfer (free)
        );

        emit TransferRouted(transferId, amount, destinationDomain, recipient);
    }

    /**
     * @notice Update the relayer address
     * @param _relayer New relayer address
     */
    function setRelayer(address _relayer) external onlyOwner {
        emit RelayerUpdated(relayer, _relayer);
        relayer = _relayer;
    }

    /**
     * @notice Allow relayer to withdraw USDC (emergency fallback)
     */
    function withdrawUsdc(address to, uint256 amount) external onlyOwner {
        require(usdc.transfer(to, amount), "USDC_TRANSFER_FAILED");
    }
}
