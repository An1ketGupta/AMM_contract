// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.13;

import { ERC20 } from "../lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";

contract GuluContract is ERC20 {

    uint private constant PRECISION = 1e18;

    event InitialMint(address indexed to, uint amount);
    event AirdropRequested(address indexed to, uint amount);

    constructor() ERC20("Gulu", "GULU") {
        address sender = msg.sender;
        uint amount = 100000000 * PRECISION;

        _mint(sender, amount);
        emit InitialMint(sender, amount);
    }

    function _requestAirdrop() public {
        _mint(msg.sender, PRECISION);
        emit AirdropRequested(msg.sender, PRECISION);
    }
}
