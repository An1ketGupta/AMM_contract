// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.13;

// I'm using the standard import path. 
// If this fails, revert to your original: "../lib/forge-std/src/Script.sol"
import { Script } from "forge-std/Script.sol";
import "forge-std/console.sol";

import "../src/AMM.sol";
import "../src/EthToken.sol";
import "../src/USDCToken.sol";

contract DeploySepolia is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        EthContract eth = new EthContract();
        UsdcContract usdc = new UsdcContract();

        AMMContract amm = new AMMContract(
            address(eth),
            address(usdc)
        );
        vm.stopBroadcast();

        console.log("SEPOLIA DEPLOYMENT SUCCESSFUL");
        console.log("VITE_ETH_ADDRESS=", address(eth));
        console.log("VITE_USDC_ADDRESS=", address(usdc));
        console.log("VITE_AMM_ADDRESS=", address(amm));
    }
}