// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.19;

import { Math } from "../lib/openzeppelin-contracts/contracts/utils/math/Math.sol";
import { ERC20 } from "../lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import { IERC20 } from "../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import { ReentrancyGuard } from "../lib/openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";

interface ETHContract is IERC20 {}
interface USDCContract is IERC20 {}

contract AMMContract is ERC20, ReentrancyGuard {

    uint private reserveEth;
    uint private reserveUsdc;

    uint constant private MINIMUM_LIQUIDITY = 1000;

    ETHContract public ethToken;
    USDCContract public usdcToken;

    event LiquidityAdded(
        address indexed provider,
        uint ethAmount,
        uint usdcAmount,
        uint sharesMinted
    );

    event LiquidityRemoved(
        address indexed provider,
        uint ethAmount,
        uint usdcAmount,
        uint sharesBurned
    );

    event Swap(
        address indexed trader,
        address indexed tokenIn,
        address indexed tokenOut,
        uint amountIn,
        uint amountOut
    );

    event Sync(uint reserveEth, uint reserveUsdc);

    constructor(address ethAddress, address usdcAddress)
        ERC20("AniketCoin", "ANC")
    {
        require(ethAddress != address(0), "Invalid Eth address");
        require(usdcAddress != address(0), "Invalid USDC address");

        ethToken = ETHContract(ethAddress);
        usdcToken = USDCContract(usdcAddress);
    }
    
    function getActualTokenAmount(
        uint ethAmount,
        uint usdcAmount
    ) public view returns (uint, uint) {
        if (reserveEth == 0 || reserveUsdc == 0) {
            return (ethAmount, usdcAmount);
        }

        uint usdcForEth = (reserveUsdc * ethAmount) / reserveEth;
        uint ethForUsdc = (reserveEth * usdcAmount) / reserveUsdc;

        if (usdcForEth <= usdcAmount) {
            return (ethAmount, usdcForEth);
        } else {
            return (ethForUsdc, usdcAmount);
        }
    }

    function calculateShare(
        uint ethAmount,
        uint usdcAmount
    ) public view returns (uint) {

        if (totalSupply() == 0) {
            uint shares = Math.sqrt(ethAmount * usdcAmount);
            require(shares > MINIMUM_LIQUIDITY, "Insufficient liquidity");
            return shares - MINIMUM_LIQUIDITY;
        }

        uint sharesEth = (ethAmount * totalSupply()) / reserveEth;
        uint sharesUsdc = (usdcAmount * totalSupply()) / reserveUsdc;

        return Math.min(sharesEth, sharesUsdc);
    }

    function GetUsdcAmountRequired(uint ethAmount) view public returns (uint){
        require(ethAmount > 0 , "Provide some tokens");
        if(reserveEth == 0 && reserveUsdc == 0){
            return 0;
        }
        else{
            uint usdcAmountRequired = ( ethAmount * reserveUsdc )/reserveEth;
            return usdcAmountRequired;
        }
    }

    function GetEthAmountRequired(uint usdcAmount) view public returns (uint){
        require(usdcAmount > 0 , "Provide some tokens");
        if(reserveEth == 0 && reserveUsdc == 0){
            return 0;
        }
        else{
            uint ethAmountRequired = ( usdcAmount * reserveEth )/reserveUsdc;
            return ethAmountRequired;
        }
    }

    function GetUsdcAmountForEth(uint receivedEth) public view returns (uint){
        uint netEth = (receivedEth * 997) / 1000;
        uint usdcOut =
            (reserveUsdc * netEth) / (reserveEth + netEth);
        return usdcOut;
    }

    function GetEthAmountForUsdc(uint receivedUsdc) public view returns (uint){
        uint netUsdc = (receivedUsdc * 997) / 1000;
        uint ethOut =
            (reserveEth * netUsdc) / (reserveUsdc + netUsdc);
        return ethOut; 
    }

    function _sync() internal {
        reserveEth = ethToken.balanceOf(address(this));
        reserveUsdc = usdcToken.balanceOf(address(this));
        emit Sync(reserveEth, reserveUsdc);
    }

    function stake(
        uint amountEth,
        uint amountUsdc,
        uint minshares
    ) public nonReentrant {

        require(amountEth > 0 && amountUsdc > 0, "Cannot stake zero tokens");

        uint ethBefore = ethToken.balanceOf(address(this));
        ethToken.transferFrom(msg.sender, address(this), amountEth);
        uint receivedEth = ethToken.balanceOf(address(this)) - ethBefore;

        uint usdcBefore = usdcToken.balanceOf(address(this));
        usdcToken.transferFrom(msg.sender, address(this), amountUsdc);
        uint receivedUsdc = usdcToken.balanceOf(address(this)) - usdcBefore;

        (uint neededEth, uint neededUsdc) =
        getActualTokenAmount(receivedEth, receivedUsdc);

        uint shares = calculateShare(neededEth, neededUsdc);
        require(shares >= minshares, "Minimum slippage violation");

        if (totalSupply() == 0) {
            _mint(address(1), MINIMUM_LIQUIDITY);
        }

        if (receivedEth > neededEth) {
            ethToken.transfer(msg.sender, receivedEth - neededEth);
        }
        if (receivedUsdc > neededUsdc) {
            usdcToken.transfer(msg.sender, receivedUsdc - neededUsdc);
        }

        _mint(msg.sender, shares);
        _sync();

        emit LiquidityAdded(msg.sender, neededEth, neededUsdc, shares);
    }

    function removeLiquidity(uint shares) public nonReentrant {
        require(shares > 0, "No shares provided");

        _sync();

        uint ethAmount = (shares * reserveEth) / totalSupply();
        uint usdcAmount = (shares * reserveUsdc) / totalSupply();

        require(
            totalSupply() - shares >= MINIMUM_LIQUIDITY,
            "Cannot remove minimum liquidity"
        );

        _burn(msg.sender, shares);

        reserveEth -= ethAmount;
        reserveUsdc -= usdcAmount;

        ethToken.transfer(msg.sender, ethAmount);
        usdcToken.transfer(msg.sender, usdcAmount);

        emit LiquidityRemoved(msg.sender, ethAmount, usdcAmount, shares);
        emit Sync(reserveEth, reserveUsdc);
    }

    function swapEthtoUsdc(uint ethAmount, uint minUsdc) public nonReentrant {
        require(ethAmount > 0, "Can't swap 0");
        require(reserveEth > 0 && reserveUsdc > 0, "No liquidity");

        uint beforeEth = ethToken.balanceOf(address(this));
        ethToken.transferFrom(msg.sender, address(this), ethAmount);
        uint receivedEth = ethToken.balanceOf(address(this)) - beforeEth;

        uint usdcOut = GetUsdcAmountForEth(receivedEth);

        require(usdcOut >= minUsdc, "Slippage");

        usdcToken.transfer(msg.sender, usdcOut);
        _sync();

        emit Swap(
            msg.sender,
            address(ethToken),
            address(usdcToken),
            receivedEth,
            usdcOut
        );
    }

    function swapUsdcToEth(uint usdcAmount, uint minEth) public nonReentrant {
        require(usdcAmount > 0, "Can't swap 0");
        require(reserveEth > 0 && reserveUsdc > 0, "No liquidity");

        uint beforeUsdc = usdcToken.balanceOf(address(this));
        usdcToken.transferFrom(msg.sender, address(this), usdcAmount);
        uint receivedUsdc = usdcToken.balanceOf(address(this)) - beforeUsdc;

        uint ethOut = GetEthAmountForUsdc(receivedUsdc);

        require(ethOut >= minEth, "Slippage");

        ethToken.transfer(msg.sender, ethOut);
        _sync();

        emit Swap(
            msg.sender,
            address(usdcToken),
            address(ethToken),
            receivedUsdc,
            ethOut
        );
    }
}
