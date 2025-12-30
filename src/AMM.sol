// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.13;
import { Math } from "../lib/openzeppelin-contracts/contracts/utils/math/Math.sol";
import { ERC20 } from "../lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import { IERC20 } from "../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import { Ownable } from "../lib/openzeppelin-contracts/contracts/access/Ownable.sol";

interface EthContract is IERC20{
    function _requestAirdrop(uint _amount) external;
}
interface UsdcContract is IERC20{
    function _requestAirdrop(uint _amount) external;
}

contract AMMContract is ERC20{
    uint public reserveEth;
    uint public reserveUSDC;
    address constant DEAD = address(0xdead);
    EthContract public ethToken;
    UsdcContract public usdcToken;

    constructor(address _tokenA , address _tokenB) ERC20("mAniketCoin" , "mANC"){
        ethToken = EthContract(_tokenA);
        usdcToken = UsdcContract(_tokenB);
    }

    function min(uint num1 , uint num2) internal pure returns (uint){
        if(num1 < num2) return num1;
        else{
            return num2;
        }
    }

    function Stake(uint _amountA , uint _amountB) public{
        require(_amountA > 0 , "Can't stake zero tokens");
        require(_amountB > 0 , "Can't stake zero tokens");

        if(_amountA > 0){
            bool success = ethToken.transferFrom(msg.sender, address(this), _amountA);
            require(success , "Didn't recieve eth from your wallet");
        }
        if(_amountB > 0){
            bool success = usdcToken.transferFrom(msg.sender, address(this), _amountB);
            require(success , "Didn't recieve USDC from your wallet");
        }
        // taking a platform fee of 0.3 percent
        uint shares = 0;
        if(totalSupply() == 0){
            shares = Math.sqrt(_amountA * _amountB) - 1000;
            require(shares > 0 , "Initial deposit too small");
            _mint(DEAD, 1000);
        }
        else{
            shares = min((_amountA * totalSupply())/reserveEth , (_amountB * totalSupply())/reserveUSDC);
            require(shares > 0 , "Initial deposit too small");
        }
        _mint(msg.sender, shares);
        reserveEth += _amountA;
        reserveUSDC += _amountB;
    }

    function SwapEthtoUSDC(uint _amount) public{
        require(_amount > 0 , "Can't swap zero tokens");
        
        bool success = ethToken.transferFrom(msg.sender, address(this), _amount);
        require(success , "Transaction blocked.");

        uint netAmount = (_amount*997)/1000;

        uint returnUSDC = (reserveUSDC * netAmount)/(reserveEth + _amount);
        success = usdcToken.transfer(msg.sender, returnUSDC);
        reserveEth += _amount;
        reserveUSDC -= returnUSDC;
    }

    function SwapUSDCtoEth(uint _amount) public{
        require(_amount > 0 , "Can't swap zero tokens");
        
        bool success = usdcToken.transferFrom(msg.sender, address(this), _amount);
        require(success , "Transaction blocked.");

        uint netAmount = (_amount*997)/1000;

        uint returnEth = (reserveEth * netAmount)/(reserveUSDC + _amount);
        success = ethToken.transfer(msg.sender, returnEth);
        reserveEth -= returnEth;
        reserveUSDC += _amount;
    }

    function Withdraw(uint _amount) public{
        require(_amount > 0 , "Amount entered is 0");
        uint returnEth = (_amount * reserveEth)/totalSupply();
        uint returnUSDC = (_amount * reserveUSDC)/totalSupply();

        _burn(msg.sender, _amount);
        ethToken.transfer(msg.sender, returnEth);
        usdcToken.transfer(msg.sender, returnUSDC);
        reserveEth -= returnEth;
        reserveUSDC -= returnUSDC;
    }
}
