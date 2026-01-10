// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.19;

import { Math } from "../lib/openzeppelin-contracts/contracts/utils/math/Math.sol";
import { ERC20 } from "../lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import { IERC20 } from "../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import { ReentrancyGuard } from "../lib/openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";

interface NCYContract is IERC20 {}
interface GULUContract is IERC20 {}

contract AMMContract is ERC20, ReentrancyGuard {

    uint private reserveNcy;
    uint private reserveGulu;

    uint constant private MINIMUM_LIQUIDITY = 1000;

    NCYContract public ncyToken;
    GULUContract public guluToken;

    event LiquidityAdded(
        address indexed provider,
        uint ncyAmount,
        uint guluAmount,
        uint sharesMinted
    );

    event LiquidityRemoved(
        address indexed provider,
        uint ncyAmount,
        uint guluAmount,
        uint sharesBurned
    );

    event Swap(
        address indexed trader,
        address indexed tokenIn,
        address indexed tokenOut,
        uint amountIn,
        uint amountOut
    );

    event Sync(uint reserveNcy, uint reserveGulu);

    constructor(address ncyAddress, address guluAddress)
        ERC20("AniketCoin", "ANC")
    {
        require(ncyAddress != address(0), "Invalid Ncy address");
        require(guluAddress != address(0), "Invalid GULU address");

        ncyToken = NCYContract(ncyAddress);
        guluToken = GULUContract(guluAddress);
    }
    
    function getActualTokenAmount(
        uint ncyAmount,
        uint guluAmount
    ) public view returns (uint, uint) {
        if (reserveNcy == 0 || reserveGulu == 0) {
            return (ncyAmount, guluAmount);
        }

        uint guluForNcy = (reserveGulu * ncyAmount) / reserveNcy;
        uint ncyForGulu = (reserveNcy * guluAmount) / reserveGulu;

        if (guluForNcy <= guluAmount) {
            return (ncyAmount, guluForNcy);
        } else {
            return (ncyForGulu, guluAmount);
        }
    }

    function calculateShare(
        uint ncyAmount,
        uint guluAmount
    ) public view returns (uint) {

        if (totalSupply() == 0) {
            uint shares = Math.sqrt(ncyAmount * guluAmount);
            require(shares > MINIMUM_LIQUIDITY, "Insufficient liquidity");
            return shares - MINIMUM_LIQUIDITY;
        }

        uint sharesNcy = (ncyAmount * totalSupply()) / reserveNcy;
        uint sharesGulu = (guluAmount * totalSupply()) / reserveGulu;

        return Math.min(sharesNcy, sharesGulu);
    }

    function GetGuluAmountRequired(uint ncyAmount) view public returns (uint){
        require(ncyAmount > 0 , "Provide some tokens");
        if(reserveNcy == 0 && reserveGulu == 0){
            return 0;
        }
        else{
            uint guluAmountRequired = ( ncyAmount * reserveGulu )/reserveNcy;
            return guluAmountRequired;
        }
    }

    function GetNcyAmountRequired(uint guluAmount) view public returns (uint){
        require(guluAmount > 0 , "Provide some tokens");
        if(reserveNcy == 0 && reserveGulu == 0){
            return 0;
        }
        else{
            uint ncyAmountRequired = ( guluAmount * reserveNcy )/reserveGulu;
            return ncyAmountRequired;
        }
    }

    function GetGuluAmountForNcy(uint receivedNcy) public view returns (uint){
        uint netNcy = (receivedNcy * 997) / 1000;
        uint guluOut =
            (reserveGulu * netNcy) / (reserveNcy + netNcy);
        return guluOut;
    }

    function GetNcyAmountForGulu(uint receivedGulu) public view returns (uint){
        uint netGulu = (receivedGulu * 997) / 1000;
        uint ncyOut =
            (reserveNcy * netGulu) / (reserveGulu + netGulu);
        return ncyOut; 
    }

    function _sync() internal {
        reserveNcy = ncyToken.balanceOf(address(this));
        reserveGulu = guluToken.balanceOf(address(this));
        emit Sync(reserveNcy, reserveGulu);
    }

    function stake(
        uint amountNcy,
        uint amountGulu,
        uint minshares
    ) public nonReentrant {

        require(amountNcy > 0 && amountGulu > 0, "Cannot stake zero tokens");

        uint ncyBefore = ncyToken.balanceOf(address(this));
        ncyToken.transferFrom(msg.sender, address(this), amountNcy);
        uint receivedNcy = ncyToken.balanceOf(address(this)) - ncyBefore;

        uint guluBefore = guluToken.balanceOf(address(this));
        guluToken.transferFrom(msg.sender, address(this), amountGulu);
        uint receivedGulu = guluToken.balanceOf(address(this)) - guluBefore;

        (uint neededNcy, uint neededGulu) =
        getActualTokenAmount(receivedNcy, receivedGulu);

        uint shares = calculateShare(neededNcy, neededGulu);
        require(shares >= minshares, "Minimum slippage violation");

        if (totalSupply() == 0) {
            _mint(address(1), MINIMUM_LIQUIDITY);
        }

        if (receivedNcy > neededNcy) {
            ncyToken.transfer(msg.sender, receivedNcy - neededNcy);
        }
        if (receivedGulu > neededGulu) {
            guluToken.transfer(msg.sender, receivedGulu - neededGulu);
        }

        _mint(msg.sender, shares);
        _sync();

        emit LiquidityAdded(msg.sender, neededNcy, neededGulu, shares);
    }

    function removeLiquidity(uint shares) public nonReentrant {
        require(shares > 0, "No shares provided");

        _sync();

        uint ncyAmount = (shares * reserveNcy) / totalSupply();
        uint guluAmount = (shares * reserveGulu) / totalSupply();

        require(
            totalSupply() - shares >= MINIMUM_LIQUIDITY,
            "Cannot remove minimum liquidity"
        );

        _burn(msg.sender, shares);

        reserveNcy -= ncyAmount;
        reserveGulu -= guluAmount;

        ncyToken.transfer(msg.sender, ncyAmount);
        guluToken.transfer(msg.sender, guluAmount);

        emit LiquidityRemoved(msg.sender, ncyAmount, guluAmount, shares);
        emit Sync(reserveNcy, reserveGulu);
    }

    function swapNcytoGulu(uint ncyAmount, uint minGulu) public nonReentrant {
        require(ncyAmount > 0, "Can't swap 0");
        require(reserveNcy > 0 && reserveGulu > 0, "No liquidity");

        uint beforeNcy = ncyToken.balanceOf(address(this));
        ncyToken.transferFrom(msg.sender, address(this), ncyAmount);
        uint receivedNcy = ncyToken.balanceOf(address(this)) - beforeNcy;

        uint guluOut = GetGuluAmountForNcy(receivedNcy);

        require(guluOut >= minGulu, "Slippage");

        guluToken.transfer(msg.sender, guluOut);
        _sync();

        emit Swap(
            msg.sender,
            address(ncyToken),
            address(guluToken),
            receivedNcy,
            guluOut
        );
    }

    function swapGuluToNcy(uint guluAmount, uint minNcy) public nonReentrant {
        require(guluAmount > 0, "Can't swap 0");
        require(reserveNcy > 0 && reserveGulu > 0, "No liquidity");

        uint beforeGulu = guluToken.balanceOf(address(this));
        guluToken.transferFrom(msg.sender, address(this), guluAmount);
        uint receivedGulu = guluToken.balanceOf(address(this)) - beforeGulu;

        uint ncyOut = GetNcyAmountForGulu(receivedGulu);

        require(ncyOut >= minNcy, "Slippage");

        ncyToken.transfer(msg.sender, ncyOut);
        _sync();

        emit Swap(
            msg.sender,
            address(guluToken),
            address(ncyToken),
            receivedGulu,
            ncyOut
        );
    }
}
