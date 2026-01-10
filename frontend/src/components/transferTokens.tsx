import { useEffect, useState } from "react";
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { AmmContractConfig } from "../configs/AMMContractConfig";
import { formatEther, parseEther } from "viem";
import { EthContractConfig } from "../configs/EthContractConfig";
import { UsdcContractConfig } from "../configs/USDCContractConfig";

type TradeDirection = "ethToUsdc" | "usdcToEth";

export default function TransferTokens() {
    const [tradeDirection, setTradeDirection] = useState<TradeDirection>("ethToUsdc");
    const { address, isConnected } = useAccount();
    const [inputAmount, setInputAmount] = useState("");
    const [outputAmount, setOutputAmount] = useState("");

    const { data: hash, writeContract, isPending: isWritePending } = useWriteContract();
    
    const { data:receipt , isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash,
    });

    const { data: expectedUsdcAmount, isLoading: loadingUsdc } = useReadContract({
        ...AmmContractConfig,
        functionName: "GetUsdcAmountForEth",
        args: [inputAmount ? parseEther(inputAmount) : 0n],
        query: { enabled: tradeDirection === "ethToUsdc" && inputAmount !== "" }
    });

    const { data: expectedEthAmount, isLoading: loadingEth } = useReadContract({
        ...AmmContractConfig,
        functionName: "GetEthAmountForUsdc",
        args: [inputAmount ? parseEther(inputAmount) : 0n],
        query: { enabled: tradeDirection === "usdcToEth" && inputAmount !== "" }
    });

    const { data: userEthAllowance, refetch: refetchEthAllowance } = useReadContract({
        ...EthContractConfig,
        functionName: "allowance",
        args: [address!, import.meta.env.VITE_AMM_ADDRESS],
        query: { enabled: address!=undefined }
    });

    const { data: userUsdcAllowance, refetch: refetchUsdcAllowance } = useReadContract({
        ...UsdcContractConfig,
        functionName: "allowance",
        args: [address!, import.meta.env.VITE_AMM_ADDRESS],
        query: { enabled: address!=undefined }
    });

    const { data: userEthBalance ,refetch:refetchEthBalance } = useReadContract({
        ...EthContractConfig,
        functionName: "balanceOf",
        args: [address!],
        query: { enabled: address != undefined }
    });

    const { data: userUsdcBalance ,refetch:refetchUsdcBalance } = useReadContract({
        ...UsdcContractConfig,
        functionName: "balanceOf",
        args: [address!],
        query: { enabled: address != undefined }
    });

    useEffect(() => {
        if (inputAmount === "") {
            setOutputAmount("");
            return;
        }
        if (tradeDirection === "ethToUsdc" && expectedUsdcAmount) {
            setOutputAmount(formatEther(expectedUsdcAmount));
        } else if (tradeDirection === "usdcToEth" && expectedEthAmount) {
            setOutputAmount(formatEther(expectedEthAmount));
        }
    }, [expectedUsdcAmount, expectedEthAmount, tradeDirection, inputAmount]);

    useEffect(() => {
        if (isConfirmed) {
            refetchEthAllowance();
            refetchUsdcAllowance();
            refetchUsdcBalance();
            refetchEthBalance();
        }
    }, [isConfirmed, refetchEthAllowance, refetchUsdcAllowance]);


    const switchDirection = () => {
        setTradeDirection(tradeDirection === "ethToUsdc" ? "usdcToEth" : "ethToUsdc");
        setInputAmount("");
        setOutputAmount("");
    };

    const parsedInput = inputAmount ? parseEther(inputAmount+10000) : 0n;
    const currentEthAllowance = userEthAllowance ?? 0n;
    const currentUsdcAllowance = userUsdcAllowance ?? 0n;

    function transferHandler() {
        if (!address) return;

        if (tradeDirection === "ethToUsdc") {
            if (currentEthAllowance < parsedInput) {
                writeContract({
                    ...EthContractConfig,
                    functionName: "approve",
                    args: [import.meta.env.VITE_AMM_ADDRESS, parsedInput]
                });
            } else {
                writeContract({
                    ...AmmContractConfig,
                    functionName: "swapEthtoUsdc",
                    args: [parsedInput, 0n] // 0n is minAmountOut (slippage protection)
                });
            }
        } else {
            if (currentUsdcAllowance < parsedInput) {
                writeContract({
                    ...UsdcContractConfig,
                    functionName: "approve",
                    args: [import.meta.env.VITE_AMM_ADDRESS, parsedInput]
                });
            } else {
                writeContract({
                    ...AmmContractConfig,
                    functionName: "swapUsdcToEth",
                    args: [parsedInput, 0n]
                });
            }
        }
    }

    const getButtonText = () => {
        if (!isConnected) return "Connect Wallet";
        if (isWritePending || isConfirming) return "Transaction Pending...";
        if (!inputAmount) return "Enter an amount";
        
        if (tradeDirection === "ethToUsdc") {
            return currentEthAllowance < parsedInput ? "Approve ETH" : "Swap";
        } else {
            return currentUsdcAllowance < parsedInput ? "Approve USDC" : "Swap";
        }
    };

    const isQuoteLoading = loadingUsdc || loadingEth;
    const isTransacting = isWritePending || isConfirming;

    const inputToken = tradeDirection === "ethToUsdc" ? "ETH" : "USDC";
    const outputToken = tradeDirection === "ethToUsdc" ? "USDC" : "ETH";
    const inputBalance = tradeDirection === "ethToUsdc" ? userEthBalance : userUsdcBalance;

    const needsApproval = tradeDirection === "ethToUsdc" 
        ? currentEthAllowance < parsedInput 
        : currentUsdcAllowance < parsedInput;

    return (
        <div className="w-full max-w-md">
            <div className="bg-gray-900/80 backdrop-blur-xl rounded-3xl p-4 border border-gray-800/50 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-white">Swap</h2>
                    <button className="p-2 hover:bg-gray-800 rounded-xl transition-colors">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </button>
                </div>

                {/* Sell Input */}
                <div className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700/50 hover:border-gray-600/50 transition-colors">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-400 text-sm">Sell</span>
                        {isConnected && inputBalance && (
                            <button 
                                onClick={() => setInputAmount(formatEther(inputBalance as bigint))}
                                className="text-gray-400 text-sm hover:text-white transition-colors"
                            >
                                Balance: {parseFloat(formatEther(inputBalance as bigint)).toFixed(4)}
                            </button>
                        )}
                    </div>
                    <div className="flex items-center justify-between gap-4">
                        <input
                            type="number"
                            className="w-full bg-transparent text-3xl font-medium text-white outline-none placeholder-gray-600"
                            placeholder="0"
                            value={inputAmount}
                            onChange={(e) => setInputAmount(e.target.value)}
                        />
                        <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-gray-700/80 hover:bg-gray-700 transition-colors cursor-pointer">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                inputToken === "ETH" 
                                    ? "bg-gradient-to-br from-blue-400 to-indigo-500" 
                                    : "bg-gradient-to-br from-blue-500 to-blue-600"
                            }`}>
                                <span className="text-white text-xs font-bold">
                                    {inputToken === "ETH" ? "Ξ" : "$"}
                                </span>
                            </div>
                            <span className="text-white font-semibold">{inputToken}</span>
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Switch Button */}
                <div className="relative h-0 flex justify-center z-10">
                    <button
                        onClick={switchDirection}
                        className="absolute -top-5 bg-gray-800 hover:bg-gray-700 border-4 border-gray-900 rounded-xl p-2 transition-all duration-200 hover:scale-110"
                    >
                        <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                    </button>
                </div>

                {/* Buy Input */}
                <div className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700/50 mt-1">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-400 text-sm">Buy</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                        <input
                            type="text"
                            className="w-full bg-transparent text-3xl font-medium text-gray-400 outline-none placeholder-gray-600"
                            placeholder="0"
                            value={isQuoteLoading ? "" : outputAmount ? parseFloat(outputAmount).toFixed(6) : ""}
                            readOnly
                        />
                        <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-gray-700/80">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                outputToken === "ETH" 
                                    ? "bg-gradient-to-br from-blue-400 to-indigo-500" 
                                    : "bg-gradient-to-br from-blue-500 to-blue-600"
                            }`}>
                                <span className="text-white text-xs font-bold">
                                    {outputToken === "ETH" ? "Ξ" : "$"}
                                </span>
                            </div>
                            <span className="text-white font-semibold">{outputToken}</span>
                        </div>
                    </div>
                    {isQuoteLoading && inputAmount && (
                        <div className="mt-2 text-gray-500 text-sm animate-pulse">Calculating...</div>
                    )}
                </div>

                {/* Price Info */}
                {inputAmount && outputAmount && parseFloat(inputAmount) > 0 && (
                    <div className="mt-4 p-3 bg-gray-800/50 rounded-xl">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Rate</span>
                            <span className="text-white">
                                1 {inputToken} = {(parseFloat(outputAmount) / parseFloat(inputAmount)).toFixed(4)} {outputToken}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm mt-1">
                            <span className="text-gray-400">Fee (0.3%)</span>
                            <span className="text-white">
                                {(parseFloat(inputAmount) * 0.003).toFixed(6)} {inputToken}
                            </span>
                        </div>
                    </div>
                )}

                {/* Action Button */}
                <button
                    onClick={transferHandler}
                    disabled={!isConnected || inputAmount === "" || isTransacting}
                    className={`w-full mt-4 py-4 rounded-2xl font-semibold text-lg transition-all duration-200 ${
                        !isConnected || inputAmount === "" || isTransacting
                            ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                            : needsApproval
                            ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/20"
                            : "bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white shadow-lg shadow-pink-500/20"
                    }`}
                >
                    {getButtonText()}
                </button>

                {/* Success Message */}
                {isConfirmed && (
                    <div className="mt-3 p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                        <p className="text-green-400 text-sm text-center">Transaction successful! ✓</p>
                    </div>
                )}
            </div>
        </div>
    );
}