// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.19;
import {
    Math
} from "../lib/openzeppelin-contracts/contracts/utils/math/Math.sol";

import {
    ERC20
} from "../lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";

import {
    IERC20
} from "../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";

import {
    ReentrancyGuard
} from "../lib/openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";

interface EthContract is IERC20 {
}

interface UsdcContract is IERC20 {
}

contract AMMContract is ERC20, ReentrancyGuard {
    uint private reserveEth;
    uint private reserveUSDC;

    uint constant private MINIMUM_LIQUIDITY = 1000;
    EthContract public ethToken;
    UsdcContract public usdcToken;

    constructor(
        address ethAddress,
        address usdcAddress
    ) ERC20("AniketCoin", "ANC") {
        require(ethAddress != address(0), "Invalid Eth address");
        require(usdcAddress != address(0), "Invalid USDC address");
        ethToken = EthContract(ethAddress);
        usdcToken = UsdcContract(usdcAddress);
        reserveEth = 0;
        reserveUSDC = 0;
    }

    function getActualTokenAmount(
        uint ethAmount,
        uint usdcAmount
    ) internal view returns (uint, uint) {
        if (reserveEth == 0 || reserveUSDC == 0) {
            return (ethAmount, usdcAmount);
        } else {
            uint usdcForEth = (reserveUSDC * ethAmount) / reserveEth;
            uint ethForUsdc = (reserveEth * usdcAmount) / reserveUSDC;
            if (usdcForEth <= usdcAmount) {
                return (ethAmount, usdcForEth);
            } else {
                return (ethForUsdc, usdcAmount);
            }
        }
    }

    function calculateShare(
        uint eth_amount,
        uint usdc_amount
    ) public view returns (uint) {
        
        if (totalSupply() == 0) {
            
            uint shares = Math.sqrt(eth_amount * usdc_amount);
            require(shares > MINIMUM_LIQUIDITY, "Insuffient tokens");
            return shares-MINIMUM_LIQUIDITY;

        } else {

            uint shares = Math.min(
                (eth_amount * totalSupply()) / reserveEth,
                (usdc_amount * totalSupply()) / reserveUSDC
            );
            return shares;

        }
    }

    function _sync() internal{
        reserveEth = ethToken.balanceOf(address(this));
        reserveUSDC = usdcToken.balanceOf(address(this));
    }
    
    function stake(
        uint amount_Eth,
        uint amount_USDC,
        uint minshares
    ) public nonReentrant {

        require(amount_Eth > 0 && amount_USDC > 0, "Cannot stake zero tokens");
        uint neededETH;
        uint neededUSDC;
        
        uint balanceBefore = ethToken.balanceOf(address(this));
        bool successEth = ethToken.transferFrom(msg.sender, address(this), amount_Eth);
        require(successEth, "Didnt receive Eth tokens");
        uint receivedEth = ethToken.balanceOf(address(this)) - balanceBefore;

        balanceBefore = usdcToken.balanceOf(address(this));
        bool successUsdc = usdcToken.transferFrom(msg.sender, address(this), amount_USDC);
        require(successUsdc, "Didnt receive USDC tokens");
        uint receivedUsdc = usdcToken.balanceOf(address(this)) - balanceBefore;

        (neededETH, neededUSDC) = getActualTokenAmount(receivedEth, receivedUsdc);
        uint shares = calculateShare(neededETH, neededUSDC); 

        require(shares >= minshares, "Minimum slippage violation.");
        
        if(totalSupply() == 0){
            _mint(address(1), MINIMUM_LIQUIDITY);
        }
        
        if (receivedEth > neededETH) {
            ethToken.transfer(msg.sender, receivedEth - neededETH);
        }
        if (receivedUsdc > neededUSDC) {
            usdcToken.transfer(msg.sender, receivedUsdc - neededUSDC);
        }
        
        _mint(msg.sender, shares);
        _sync();
    }

    function swapEthtoUsdc(
        uint ethAmount,
        uint minUSDC
        ) public nonReentrant{
            
        require(ethAmount > 0 , "Can't swap 0 tokens");
        require(reserveEth > 0 && reserveUSDC > 0 , "No liquidity in the pool");
        uint ethBefore = ethToken.balanceOf(address(this));
        bool success = ethToken.transferFrom(msg.sender, address(this), ethAmount);
        require(success , "Didn't receive eth tokens");
        uint receivedEth = ethToken.balanceOf(address(this)) - ethBefore;

        uint netEth = (receivedEth * 997)/1000;
        uint USDCtokens = (reserveUSDC * netEth)/(reserveEth + netEth);
        require(USDCtokens >= minUSDC , "Minimum slippage violation.");

        usdcToken.transfer(msg.sender, USDCtokens);
        _sync();
    }
    
    function swapUsdcToEth(
        uint usdcAmount,
        uint minEth
        ) public nonReentrant{
            
        require(usdcAmount > 0 , "Can't swap 0 tokens");
        require(reserveEth > 0 && reserveUSDC > 0 , "No liquidity in the pool");
        uint usdcBefore = usdcToken.balanceOf(address(this));
        bool success = usdcToken.transferFrom(msg.sender, address(this), usdcAmount);
        require(success , "Didn't receive eth tokens");
        uint receivedUsdc = usdcToken.balanceOf(address(this)) - usdcBefore;

        uint netUsdc = (receivedUsdc * 997)/1000;
        uint ETHTokens = (reserveEth * netUsdc)/(reserveUSDC + netUsdc);
        require(ETHTokens >= minEth , "Minimum slippage violation.");

        ethToken.transfer(msg.sender, ETHTokens);
        _sync();
    }

    function removeLiquidity(
    uint shares
    ) public nonReentrant {
        require(shares > 0 , "No shares provided");

        _sync();

        require(reserveEth > 0 && reserveUSDC > 0, "Pool is empty");
        uint ethAmount = (shares * reserveEth) / totalSupply();
        uint usdcAmount = (shares * reserveUSDC) / totalSupply();
        require(totalSupply() - shares >= MINIMUM_LIQUIDITY,"Cannot remove minimum liquidity");
        _burn(msg.sender, shares);

        reserveEth = reserveEth - ethAmount;
        reserveUSDC = reserveUSDC - usdcAmount;

        bool success1 = ethToken.transfer(msg.sender, ethAmount);
        bool success2 = usdcToken.transfer(msg.sender, usdcAmount);

        require(success1, "ETH transfer failed");
        require(success2, "USDC transfer failed");
    }
}
