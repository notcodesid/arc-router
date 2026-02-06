// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/ArcRouter.sol";

contract DeployScript is Script {
    function run() external {
        // Arc Testnet addresses
        address tokenMessenger = 0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA;
        address usdc = 0x3600000000000000000000000000000000000000;
        address relayer = vm.envAddress("RELAYER_ADDRESS");

        vm.startBroadcast();

        ArcRouter router = new ArcRouter(tokenMessenger, usdc, relayer);

        console.log("ArcRouter deployed at:", address(router));

        vm.stopBroadcast();
    }
}
