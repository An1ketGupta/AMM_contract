import { useEffect, useState } from "react"
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi"
import { AmmContractConfig } from "../configs/AMMContractConfig";
import { formatEther, parseEther } from "viem";
import { NcyContractConfig } from "../configs/NcyContractConfig";
import { GuluContractConfig } from "../configs/GuluContractConfig";
import { useToast } from "./Toast";

export default function RemoveLiquidity() {
    const [ANCTokens, setANCTokens] = useState<string>("")
    const { address, isConnected } = useAccount();
    const { data:hash, writeContract, isPending } = useWriteContract();
    const toast = useToast();
    const { data:receipt, isLoading: isConfirming } = useWaitForTransactionReceipt({
        hash
    });

    const { data: userANCBalance , refetch: refetchANCBalance } = useReadContract({
        ...AmmContractConfig,
        functionName: "balanceOf",
        args: [
            // @ts-ignore
            address
        ],
        query: {
            enabled: address != undefined
        }
    })
    
    const { refetch: refetchNcyBalance } = useReadContract({
        ...NcyContractConfig,
        functionName: "balanceOf",
        args: [
            // @ts-ignore
            address
        ],
        query: {
            enabled: address != undefined
        }
    })
    
    const { refetch: refetchGuluBalance } = useReadContract({
        ...GuluContractConfig,
        functionName: "balanceOf",
        args: [
            // @ts-ignore
            address
        ],
        query: {
            enabled: address != undefined
        }
    })

    // Get pool reserves to calculate expected returns
    const { data: poolNcyBalance } = useReadContract({
        ...NcyContractConfig,
        functionName: "balanceOf",
        args: [import.meta.env.VITE_AMM_ADDRESS],
    })

    const { data: poolGuluBalance } = useReadContract({
        ...GuluContractConfig,
        functionName: "balanceOf",
        args: [import.meta.env.VITE_AMM_ADDRESS],
    })

    const { data: totalSupply } = useReadContract({
        ...AmmContractConfig,
        functionName: "totalSupply",
    })

    useEffect(()=>{
        if(receipt?.status == "success"){
            toast.success("Successfully removed liquidity!")
            refetchANCBalance()
            refetchNcyBalance()
            refetchGuluBalance()
            setANCTokens("")
        }
        if(receipt?.status == "reverted"){
            toast.error("Transaction failed")
        }
    },[receipt])

    function RemoveLiquidityHandler() {
        writeContract({
            ...AmmContractConfig,
            functionName: "removeLiquidity",
            args: [
                parseEther(ANCTokens)
            ]
        },{
            onError:()=>{
                toast.warning("Transaction cancelled")
            }
        })
    }

    function inputHandler(e: any) {
        const value = e.target.value
        setANCTokens(value)
    }

    function buttonHandler() {
        if (!address) return "Connect Wallet"
        if (ANCTokens == "") return "Enter shares"
        // @ts-ignore
        if (userANCBalance < parseEther(ANCTokens)) return "Not enough shares"
        return "Remove Liquidity"
    }

    // Calculate expected returns
    const calculateExpectedReturns = () => {
        if (!ANCTokens || !totalSupply || !poolNcyBalance || !poolGuluBalance) {
            return { ncy: "0", gulu: "0" };
        }
        const shares = parseEther(ANCTokens);
        const total = totalSupply as bigint;
        const ncyReserve = poolNcyBalance as bigint;
        const guluReserve = poolGuluBalance as bigint;

        if (total === 0n) return { ncy: "0", gulu: "0" };

        const ncyAmount = (shares * ncyReserve) / total;
        const guluAmount = (shares * guluReserve) / total;

        return {
            ncy: parseFloat(formatEther(ncyAmount)).toFixed(6),
            gulu: parseFloat(formatEther(guluAmount)).toFixed(6),
        };
    };

    const expectedReturns = calculateExpectedReturns();
    const isProcessing = isPending || isConfirming;

    return (
        <div className="w-full max-w-md">
            <div className="bg-gray-900/80 backdrop-blur-xl rounded-3xl p-4 border border-gray-800/50 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-white">Remove Liquidity</h2>
                    {isConnected && userANCBalance && (
                        <span className="text-xs text-gray-500 bg-purple-500/10 px-2 py-1 rounded-full border border-purple-500/20">
                            ANC: {parseFloat(formatEther(userANCBalance as bigint)).toFixed(4)}
                        </span>
                    )}
                </div>

                {/* LP Token Input */}
                <div className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700/50 hover:border-gray-600/50 transition-colors">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-400 text-sm">LP Tokens to burn</span>
                        {isConnected && userANCBalance && (
                            <button 
                                onClick={() => setANCTokens(formatEther(userANCBalance as bigint))}
                                className="text-gray-400 text-sm hover:text-white transition-colors"
                            >
                                Max: {parseFloat(formatEther(userANCBalance as bigint)).toFixed(4)}
                            </button>
                        )}
                    </div>
                    <div className="flex items-center justify-between gap-4">
                        <input
                            onChange={inputHandler}
                            value={ANCTokens}
                            type="number"
                            className="w-full bg-transparent text-3xl font-medium text-white outline-none placeholder-gray-600"
                            placeholder="0"
                        />
                        <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                <span className="text-white text-xs font-bold">A</span>
                            </div>
                            <span className="text-white font-semibold">ANC</span>
                        </div>
                    </div>
                </div>

                {/* Arrow */}
                <div className="flex justify-center my-3">
                    <div className="bg-gray-800 rounded-xl p-2">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                    </div>
                </div>

                {/* Expected Returns */}
                <div className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700/50">
                    <span className="text-gray-400 text-sm">You will receive</span>
                    
                    <div className="mt-3 space-y-3">
                        {/* NCY Return */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                                    <span className="text-white text-sm font-bold">N</span>
                                </div>
                                <span className="text-white font-medium">NCY</span>
                            </div>
                            <span className="text-2xl font-semibold text-white">
                                {ANCTokens ? expectedReturns.ncy : "0"}
                            </span>
                        </div>

                        {/* GULU Return */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                                    <span className="text-white text-sm font-bold">G</span>
                                </div>
                                <span className="text-white font-medium">GULU</span>
                            </div>
                            <span className="text-2xl font-semibold text-white">
                                {ANCTokens ? expectedReturns.gulu : "0"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Percentage Buttons */}
                {isConnected && userANCBalance && (userANCBalance as bigint) > 0n && (
                    <div className="flex gap-2 mt-4">
                        {[25, 50, 75, 100].map((pct) => (
                            <button
                                key={pct}
                                onClick={() => {
                                    const balance = userANCBalance as bigint;
                                    const amount = (balance * BigInt(pct)) / 100n;
                                    setANCTokens(formatEther(amount));
                                }}
                                className="flex-1 py-2 rounded-xl text-sm font-medium bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors border border-gray-700"
                            >
                                {pct}%
                            </button>
                        ))}
                    </div>
                )}

                {/* Action Button */}
                <button
                    onClick={RemoveLiquidityHandler}
                    disabled={buttonHandler() !== "Remove Liquidity" || isProcessing}
                    className={`w-full mt-4 py-4 rounded-2xl font-semibold text-lg transition-all duration-200 ${
                        buttonHandler() === "Connect Wallet"
                            ? "bg-gradient-to-r from-pink-500 to-pink-600 text-white cursor-not-allowed opacity-60"
                            : buttonHandler() === "Enter shares"
                            ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                            : buttonHandler() === "Not enough shares"
                            ? "bg-red-500/20 text-red-400 cursor-not-allowed border border-red-500/30"
                            : isProcessing
                            ? "bg-gray-800 text-gray-400 cursor-not-allowed"
                            : "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-lg shadow-red-500/20"
                    }`}
                >
                    {isProcessing ? "Processing..." : buttonHandler()}
                </button>

                {/* Warning */}
                {ANCTokens && parseFloat(ANCTokens) > 0 && buttonHandler() === "Remove Liquidity" && (
                    <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                        <p className="text-yellow-400 text-sm text-center">
                            ⚠️ Removing liquidity will burn your LP tokens
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}