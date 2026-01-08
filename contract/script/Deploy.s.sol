// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.13;
import { Script }from "../lib/forge-std/src/Script.sol";
import "../lib/forge-std/src/console.sol";
import "../src/AMM.sol";
import "../src/EthToken.sol";
import "../src/USDCToken.sol";

contract Deploy is Script{
    function run() external{
        uint deployerPrivateKey = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;
        vm.startBroadcast(deployerPrivateKey);

        EthContract eth = new EthContract();
        UsdcContract usdc = new UsdcContract();

        AMMContract amm = new AMMContract(
            address(eth),
            address(usdc)
        );

        vm.stopBroadcast();

        console.log("ETH Token Address:", address(eth));
        console.log("USDC Token Address:", address(usdc));
        console.log("AMM Contract Address:", address(amm));
    }
}