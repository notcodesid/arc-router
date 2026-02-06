// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/ArcRouter.sol";

contract MockERC20 is IERC20 {
    mapping(address => uint256) public balances;
    mapping(address => mapping(address => uint256)) public allowances;

    function mint(address to, uint256 amount) external {
        balances[to] += amount;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowances[msg.sender][spender] = amount;
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        balances[from] -= amount;
        balances[to] += amount;
        return true;
    }

    function balanceOf(address account) external view returns (uint256) {
        return balances[account];
    }
}

contract MockTokenMessenger is ITokenMessengerV2 {
    uint256 public lastAmount;
    uint32 public lastDestDomain;
    bytes32 public lastRecipient;

    function depositForBurn(
        uint256 amount,
        uint32 destinationDomain,
        bytes32 mintRecipient,
        address,
        bytes32,
        uint256,
        uint32
    ) external returns (bytes32) {
        lastAmount = amount;
        lastDestDomain = destinationDomain;
        lastRecipient = mintRecipient;
        return keccak256(abi.encode(amount, destinationDomain, mintRecipient));
    }
}

contract ArcRouterTest is Test {
    ArcRouter public router;
    MockERC20 public usdc;
    MockTokenMessenger public messenger;

    address public owner = address(this);
    address public relayer = address(0x1);
    address public user = address(0x2);

    function setUp() public {
        usdc = new MockERC20();
        messenger = new MockTokenMessenger();
        router = new ArcRouter(address(messenger), address(usdc), relayer);
    }

    function test_routeTransfer() public {
        // Fund the router
        usdc.mint(address(router), 1_000_000); // 1 USDC

        bytes32 transferId = keccak256("test-transfer");
        bytes32 recipient = bytes32(uint256(uint160(user)));

        vm.prank(relayer);
        router.routeTransfer(transferId, 1_000_000, 6, recipient);

        assertEq(messenger.lastAmount(), 1_000_000);
        assertEq(messenger.lastDestDomain(), 6);
        assertEq(messenger.lastRecipient(), recipient);
    }

    function test_routeTransfer_onlyRelayer() public {
        usdc.mint(address(router), 1_000_000);

        bytes32 transferId = keccak256("test-transfer");
        bytes32 recipient = bytes32(uint256(uint160(user)));

        vm.prank(user);
        vm.expectRevert(ArcRouter.OnlyRelayer.selector);
        router.routeTransfer(transferId, 1_000_000, 6, recipient);
    }

    function test_routeTransfer_insufficientBalance() public {
        bytes32 transferId = keccak256("test-transfer");
        bytes32 recipient = bytes32(uint256(uint160(user)));

        vm.prank(relayer);
        vm.expectRevert(ArcRouter.InsufficientBalance.selector);
        router.routeTransfer(transferId, 1_000_000, 6, recipient);
    }

    function test_setRelayer() public {
        address newRelayer = address(0x3);
        router.setRelayer(newRelayer);
        assertEq(router.relayer(), newRelayer);
    }

    function test_setRelayer_onlyOwner() public {
        vm.prank(user);
        vm.expectRevert(ArcRouter.OnlyOwner.selector);
        router.setRelayer(address(0x3));
    }

    function test_emitsTransferRouted() public {
        usdc.mint(address(router), 1_000_000);

        bytes32 transferId = keccak256("test-transfer");
        bytes32 recipient = bytes32(uint256(uint160(user)));

        vm.prank(relayer);
        vm.expectEmit(true, false, false, true);
        emit ArcRouter.TransferRouted(transferId, 1_000_000, 6, recipient);
        router.routeTransfer(transferId, 1_000_000, 6, recipient);
    }
}
