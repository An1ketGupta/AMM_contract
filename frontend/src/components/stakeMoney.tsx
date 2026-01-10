import { useEffect, useRef, useState } from "react"
import { AmmContractConfig } from "../configs/AMMContractConfig";
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { formatEther, parseEther } from "viem";
import { NcyContractConfig } from "../configs/NcyContractConfig";
import { GuluContractConfig } from "../configs/GuluContractConfig";
import type { PoolSupplyHandle } from "./poolSupply";
import PoolSupply from "./poolSupply";
import { useToast } from "./Toast";

export default function StakeMoney() {
    const [ncyAmount, setNcyAmount] = useState<string>("")
    const guluInputRef = useRef<HTMLInputElement | null>(null)
    const [guluAmount, setGuluAmount] = useState<string>("")
    const [activeTab, setActiveTab] = useState<"ncy" | "gulu" | "">("");
    const { address, isConnected } = useAccount();
    const [isProcessing, setProccessing] = useState(false)
    const [currentTransaction, setCurrentTransaction] = useState<"ncyapprove" | "guluapprove" | "stake" | "">("")
    const poolRef = useRef<PoolSupplyHandle>(null);
    const { data: hash, writeContract } = useWriteContract()
    const { data: receipt } = useWaitForTransactionReceipt({
        hash
    })
    const toast = useToast();


    useEffect(() => {
        if (guluInputRef.current) {
            guluInputRef.current.disabled = true;
        }
    }, [])

    const { data: guluAmountRequired } = useReadContract({
        ...AmmContractConfig,
        functionName: "GetGuluAmountRequired",
        args: [ncyAmount ? BigInt(parseEther(ncyAmount)) : 0n],
        query: {
            enabled: activeTab == "ncy" && ncyAmount != ""
        }
    })

    const { data: ncyAmountRequired } = useReadContract({
        ...AmmContractConfig,
        functionName: "GetNcyAmountRequired",
        args: [guluAmount ? BigInt(parseEther(guluAmount)) : 0n],
        query: {
            enabled: activeTab == "gulu" && guluAmount != ""
        }
    })

    // NEW: Calculate expected shares based on current inputs
    const { data: expectedShares } = useReadContract({
        ...AmmContractConfig,
        functionName: "calculateShare",
        args: [
            ncyAmount ? parseEther(ncyAmount) : 0n,
            guluAmount ? parseEther(guluAmount) : 0n
        ],
        query: {
            // Only fetch if both inputs have values
            enabled: ncyAmount !== "" && guluAmount !== "" && Number(ncyAmount) > 0 && Number(guluAmount) > 0
        }
    })

    useEffect(() => {
        if (guluAmountRequired == BigInt(0) && activeTab == "ncy") {
            if (guluInputRef.current)
                guluInputRef.current.disabled = false;
        }
        // @ts-ignore
        else if (guluAmountRequired && activeTab == "ncy") {
            setGuluAmount(formatEther(guluAmountRequired).toString())
        }
    }, [guluAmountRequired, activeTab])

    useEffect(() => {
        if (ncyAmountRequired && activeTab == "gulu") {
            setNcyAmount(formatEther(ncyAmountRequired).toString())
        }
    }, [ncyAmountRequired, activeTab])

    function ncyHandler(e: any) {
        const value = e.target.value;
        setNcyAmount(value);
        setActiveTab("ncy")
        if (value == "") {
            setActiveTab("")
            setNcyAmount("");
        }
    }

    function guluHandler(e: any) {
        const value = e.target.value
        setActiveTab("gulu")
        setGuluAmount(value)
        if (value == "") {
            setActiveTab("")
            setGuluAmount("")
        }
    }

    const { data: userNcyAllowance, refetch: refetchNcyAllowance } = useReadContract({
        ...NcyContractConfig,
        functionName: "allowance",
        args: [
            // @ts-ignore
            address,
            import.meta.env.VITE_AMM_ADDRESS
        ],
        query: {
            enabled: address != undefined && isConnected
        }
    })

    const { data: userGuluAllowance, refetch: refetchGuluAllowance } = useReadContract({
        ...GuluContractConfig,
        functionName: "allowance",
        args: [
            // @ts-ignore
            address,
            import.meta.env.VITE_AMM_ADDRESS
        ],
        query: {
            enabled: address != undefined && isConnected
        }
    })

    const { data: userANCBalance, refetch: refetchANCBalance } = useReadContract({
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

    const { data: userNcyBalance, refetch: refetchNcyBalance } = useReadContract({
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

    const { data: userGuluBalance, refetch: refetchGuluBalance } = useReadContract({
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

    useEffect(() => {
        if (receipt?.status == "success") {
            const messages: Record<string, string> = {
                "ncyapprove": "NCY approved successfully!",
                "guluapprove": "GULU approved successfully!",
                "stake": "Successfully added liquidity!"
            };
            toast.success(messages[currentTransaction] || "Transaction successful!")
            setProccessing(false)
            setCurrentTransaction("")
            refetchNcyAllowance();
            refetchGuluAllowance();
            // Refetch balances after successful transaction
            poolRef.current?.refetchPoolSupply();
            refetchNcyBalance();
            refetchGuluBalance();
            refetchANCBalance();
        }
        else if (receipt?.status == 'reverted') {
            toast.error("Transaction failed")
            setCurrentTransaction("")
            setProccessing(false)
        }
    }, [receipt])

    function ButtonHandler() {
        if (!isProcessing) {
            setProccessing(true)
            // @ts-ignore
            if (formatEther(userNcyAllowance) < (Number(ncyAmount))) {
                setCurrentTransaction("ncyapprove")
                // @ts-ignore
                writeContract({
                    ...NcyContractConfig,
                    functionName: "approve",
                    args: [
                        // @ts-ignore
                        import.meta.env.VITE_AMM_ADDRESS,
                        parseEther(Number(ncyAmount+10000).toString())
                    ]
                }, {
                    onError: () => {
                        setCurrentTransaction("")
                        toast.warning("Transaction cancelled")
                    }
                })
            }
            // @ts-ignore
            else if (formatEther(userGuluAllowance) < (Number(guluAmount))) {
                setCurrentTransaction("guluapprove")
                // @ts-ignore
                writeContract({
                    ...GuluContractConfig,
                    functionName: "approve",
                    args: [
                        // @ts-ignore
                        import.meta.env.VITE_AMM_ADDRESS,
                        parseEther(Number(guluAmount+10000).toString())
                    ]
                }, {
                    onError: () => {
                        setCurrentTransaction("")
                        toast.warning("Transaction cancelled")
                    }
                })
            }
            else {
                setCurrentTransaction("stake")
                writeContract({
                    ...AmmContractConfig,
                    functionName: "stake",
                    args: [
                        parseEther(ncyAmount),
                        parseEther(guluAmount),
                        0n
                    ]
                }, {
                    onError: () => {
                        toast.warning("Transaction cancelled")
                        setCurrentTransaction("")
                    }
                })
            }
        }
    }

    const getButtonText = () => {
        if (!isConnected) return "Connect Wallet";
        if (!ncyAmount || !guluAmount) return "Enter amount"
        if (userNcyBalance && Number(ncyAmount) > Number(formatEther(userNcyBalance as bigint))) {
            return "Insufficient NCY Balance";
        }
        if (userGuluBalance && Number(guluAmount) > Number(formatEther(userGuluBalance as bigint))) {
            return "Insufficient GULU Balance";
        }
        // @ts-ignore
        if (formatEther(userNcyAllowance) < Number(ncyAmount)) return "Approve Ncy"
        // @ts-ignore
        if (formatEther(userGuluAllowance) < Number(guluAmount)) return "Approve GULU"
        return "Stake Tokens"
    }

    return (
        <div className="w-full max-w-md mx-auto">
            {/* Protocol Stats Header */}
            <div className="mb-4">
                <PoolSupply ref={poolRef} />
            </div>

            {/* Main Card */}
            <div className="bg-gray-900/80 backdrop-blur-xl rounded-3xl p-4 border border-gray-800/50 shadow-2xl">
                {/* Card Header */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-white">Add Liquidity</h2>
                    {isConnected && (
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400 bg-purple-500/10 px-2 py-1 rounded-full border border-purple-500/20">
                                ANC: {userANCBalance ? parseFloat(formatEther(userANCBalance as bigint)).toFixed(4) : "0"}
                            </span>
                        </div>
                    )}
                </div>

                {/* NCY Input Block */}
                <div className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700/50 hover:border-gray-600/50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">You deposit</span>
                        {isConnected && (
                            <button 
                                onClick={() => {
                                    if (userNcyBalance) {
                                        const balance = formatEther(userNcyBalance as bigint);
                                        setNcyAmount(balance);
                                        setActiveTab("ncy");
                                    }
                                }}
                                className="text-xs text-gray-500 hover:text-white transition-colors"
                            >
                                Balance: {userNcyBalance ? parseFloat(formatEther(userNcyBalance as bigint)).toFixed(4) : "0"}
                            </button>
                        )}
                    </div>
                    <div className="flex items-center justify-between gap-4">
                        <input
                            type="number"
                            value={ncyAmount}
                            onChange={ncyHandler}
                            className="w-full bg-transparent text-3xl font-medium text-white outline-none placeholder-gray-600"
                            placeholder="0"
                        />
                        <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-gray-700/80">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                                <span className="text-white text-xs font-bold">N</span>
                            </div>
                            <span className="font-semibold text-white">NCY</span>
                        </div>
                    </div>
                </div>

                {/* Plus Divider */}
                <div className="flex justify-center -my-1 relative z-10">
                    <div className="bg-gray-800 border-4 border-gray-900 rounded-xl p-1">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
                        </svg>
                    </div>
                </div>

                {/* GULU Input Block */}
                <div className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700/50 hover:border-gray-600/50 transition-colors mt-1">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">You deposit</span>
                        {isConnected && (
                            <button 
                                onClick={() => {
                                    if (userGuluBalance && guluInputRef.current && !guluInputRef.current.disabled) {
                                        const balance = formatEther(userGuluBalance as bigint);
                                        setGuluAmount(balance);
                                        setActiveTab("gulu");
                                    }
                                }}
                                className="text-xs text-gray-500 hover:text-white transition-colors"
                            >
                                Balance: {userGuluBalance ? parseFloat(formatEther(userGuluBalance as bigint)).toFixed(2) : "0"}
                            </button>
                        )}
                    </div>
                    <div className="flex items-center justify-between gap-4">
                        <input
                            type="number"
                            ref={guluInputRef}
                            value={guluAmount}
                            onChange={guluHandler}
                            className="w-full bg-transparent text-3xl font-medium text-white outline-none placeholder-gray-600 disabled:text-gray-500"
                            placeholder="0"
                        />
                        <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-gray-700/80">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                                <span className="text-white text-xs font-bold">G</span>
                            </div>
                            <span className="font-semibold text-white">GULU</span>
                        </div>
                    </div>
                </div>

                {/* Expected Shares Info */}
                {ncyAmount && guluAmount && (
                    <div className="mt-4 p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-400">You will receive</span>
                            <div className="flex items-center gap-2">
                                <span className="text-xl font-bold text-purple-400">
                                    {expectedShares ? parseFloat(formatEther(expectedShares as bigint)).toFixed(6) : "0"}
                                </span>
                                <span className="text-sm font-medium text-purple-300">ANC</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Action Button */}
                <button
                    disabled={getButtonText() !== "Stake Tokens" && getButtonText() !== "Approve Ncy" && getButtonText() !== "Approve GULU"}
                    onClick={ButtonHandler}
                    className={`w-full mt-4 py-4 rounded-2xl font-semibold text-lg transition-all duration-200 ${
                        getButtonText() === "Connect Wallet"
                            ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                            : getButtonText() === "Enter amount"
                            ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                            : getButtonText().includes("Insufficient")
                            ? "bg-red-500/20 text-red-400 cursor-not-allowed border border-red-500/30"
                            : getButtonText().startsWith("Approve")
                            ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/20"
                            : "bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white shadow-lg shadow-pink-500/20"
                    } disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none`}
                >
                    {isProcessing ? "Processing..." : getButtonText()}
                </button>
            </div>
        </div>
    )
}           