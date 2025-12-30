// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.13;

import {
    ERC20
} from "../lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import {
    Ownable
} from "../lib/openzeppelin-contracts/contracts/access/Ownable.sol";

contract EthContract is ERC20 {
    uint private constant Precision = 1e18;

    constructor() ERC20("Ethereum", "ETH") {
        address sender = msg.sender;
        _mint(sender, 100 * Precision);
    }

    function _requestAirdrop(uint _amount) external {
        _mint(msg.sender, _amount * Precision);
    }
}
