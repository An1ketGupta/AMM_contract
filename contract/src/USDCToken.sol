// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.13;

import { ERC20 } from "../lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";

contract UsdcContract is ERC20 {

    uint private constant PRECISION = 1e18;

    event InitialMint(address indexed to, uint amount);
    event AirdropRequested(address indexed to, uint amount);

    constructor() ERC20("USDT", "USDT") {
        address sender = msg.sender;
        uint amount = 100 * PRECISION;

        _mint(sender, amount);
        emit InitialMint(sender, amount);
    }

    function _requestAirdrop(uint amount) public {
        require(amount > 0, "Zero amount");

        _mint(msg.sender, amount);
        emit AirdropRequested(msg.sender, amount);
    }
}
