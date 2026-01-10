// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.13;

// I'm using the standard import path. 
// If this fails, revert to your original: "../lib/forge-std/src/Script.sol"
import { Script } from "forge-std/Script.sol";
import "forge-std/console.sol";

import "../src/AMM.sol";
import "../src/NcyToken.sol";
import "../src/GuluToken.sol";

contract DeploySepolia is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        NcyContract ncy = new NcyContract();
        GuluContract gulu = new GuluContract();

        AMMContract amm = new AMMContract(
            address(ncy),
            address(gulu)
        );
        vm.stopBroadcast();

        console.log("SEPOLIA DEPLOYMENT SUCCESSFUL");
        console.log("VITE_NCY_ADDRESS=", address(ncy));
        console.log("VITE_GULU_ADDRESS=", address(gulu));
        console.log("VITE_AMM_ADDRESS=", address(amm));
    }
}