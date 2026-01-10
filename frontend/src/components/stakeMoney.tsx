import { useEffect, useRef, useState } from "react"
import { AmmContractConfig } from "../configs/AMMContractConfig";
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { formatEther, parseEther } from "viem";
import { EthContractConfig } from "../configs/EthContractConfig";
import { UsdcContractConfig } from "../configs/USDCContractConfig";
import type { PoolSupplyHandle } from "./poolSupply";
import PoolSupply from "./poolSupply";
import { useToast } from "./Toast";

export default function StakeMoney() {
    const [ethAmount, setEthAmount] = useState<string>("")
    const usdcInputRef = useRef<HTMLInputElement | null>(null)
    const [usdcAmount, setUsdcAmount] = useState<string>("")
    const [activeTab, setActiveTab] = useState<"eth" | "usdc" | "">("");
    const { address, isConnected } = useAccount();
    const [isProcessing, setProccessing] = useState(false)
    const [currentTransaction, setCurrentTransaction] = useState<"ethapprove" | "usdcapprove" | "stake" | "">("")
    const poolRef = useRef<PoolSupplyHandle>(null);
    const { data: hash, writeContract } = useWriteContract()
    const { data: receipt } = useWaitForTransactionReceipt({
        hash
    })
    const toast = useToast();


    useEffect(() => {
        if (usdcInputRef.current) {
            usdcInputRef.current.disabled = true;
        }
    }, [])

    const { data: usdcAmountRequired } = useReadContract({
        ...AmmContractConfig,
        functionName: "GetUsdcAmountRequired",
        args: [ethAmount ? BigInt(parseEther(ethAmount)) : 0n],
        query: {
            enabled: activeTab == "eth" && ethAmount != ""
        }
    })

    const { data: ethAmountRequired } = useReadContract({
        ...AmmContractConfig,
        functionName: "GetEthAmountRequired",
        args: [usdcAmount ? BigInt(parseEther(usdcAmount)) : 0n],
        query: {
            enabled: activeTab == "usdc" && usdcAmount != ""
        }
    })

    // NEW: Calculate expected shares based on current inputs
    const { data: expectedShares } = useReadContract({
        ...AmmContractConfig,
        functionName: "calculateShare",
        args: [
            ethAmount ? parseEther(ethAmount) : 0n,
            usdcAmount ? parseEther(usdcAmount) : 0n
        ],
        query: {
            // Only fetch if both inputs have values
            enabled: ethAmount !== "" && usdcAmount !== "" && Number(ethAmount) > 0 && Number(usdcAmount) > 0
        }
    })

    useEffect(() => {
        if (usdcAmountRequired == BigInt(0) && activeTab == "eth") {
            if (usdcInputRef.current)
                usdcInputRef.current.disabled = false;
        }
        // @ts-ignore
        else if (usdcAmountRequired && activeTab == "eth") {
            setUsdcAmount(formatEther(usdcAmountRequired).toString())
        }
    }, [usdcAmountRequired, activeTab])

    useEffect(() => {
        if (ethAmountRequired && activeTab == "usdc") {
            setEthAmount(formatEther(ethAmountRequired).toString())
        }
    }, [ethAmountRequired, activeTab])

    function ethHandler(e: any) {
        const value = e.target.value;
        setEthAmount(value);
        setActiveTab("eth")
        if (value == "") {
            setActiveTab("")
            setEthAmount("");
        }
    }

    function usdcHandler(e: any) {
        const value = e.target.value
        setActiveTab("usdc")
        setUsdcAmount(value)
        if (value == "") {
            setActiveTab("")
            setUsdcAmount("")
        }
    }

    const { data: userEthAllowance, refetch: refetchEthAllowance } = useReadContract({
        ...EthContractConfig,
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

    const { data: userUsdcAllowance, refetch: refetchUsdcAllowance } = useReadContract({
        ...UsdcContractConfig,
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

    const { data: userEthBalance, refetch: refetchEthBalance } = useReadContract({
        ...EthContractConfig,
        functionName: "balanceOf",
        args: [
            // @ts-ignore
            address
        ],
        query: {
            enabled: address != undefined
        }
    })

    const { data: userUsdcBalance, refetch: refetchUsdcBalance } = useReadContract({
        ...UsdcContractConfig,
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
                "ethapprove": "ETH approved successfully!",
                "usdcapprove": "USDC approved successfully!",
                "stake": "Successfully added liquidity!"
            };
            toast.success(messages[currentTransaction] || "Transaction successful!")
            setProccessing(false)
            setCurrentTransaction("")
            refetchEthAllowance();
            refetchUsdcAllowance();
            // Refetch balances after successful transaction
            poolRef.current?.refetchPoolSupply();
            refetchEthBalance();
            refetchUsdcBalance();
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
            if (formatEther(userEthAllowance) < (Number(ethAmount))) {
                setCurrentTransaction("ethapprove")
                // @ts-ignore
                writeContract({
                    ...EthContractConfig,
                    functionName: "approve",
                    args: [
                        // @ts-ignore
                        import.meta.env.VITE_AMM_ADDRESS,
                        parseEther(Number(ethAmount+10000).toString())
                    ]
                }, {
                    onError: () => {
                        setCurrentTransaction("")
                        toast.warning("Transaction cancelled")
                    }
                })
            }
            // @ts-ignore
            else if (formatEther(userUsdcAllowance) < (Number(usdcAmount))) {
                setCurrentTransaction("usdcapprove")
                // @ts-ignore
                writeContract({
                    ...UsdcContractConfig,
                    functionName: "approve",
                    args: [
                        // @ts-ignore
                        import.meta.env.VITE_AMM_ADDRESS,
                        parseEther(Number(usdcAmount+10000).toString())
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
                        parseEther(ethAmount),
                        parseEther(usdcAmount),
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
        if (!ethAmount || !usdcAmount) return "Enter amount"
        if (userEthBalance && Number(ethAmount) > Number(formatEther(userEthBalance as bigint))) {
            return "Insufficient ETH Balance";
        }
        if (userUsdcBalance && Number(usdcAmount) > Number(formatEther(userUsdcBalance as bigint))) {
            return "Insufficient USDC Balance";
        }
        // @ts-ignore
        if (formatEther(userEthAllowance) < Number(ethAmount)) return "Approve Eth"
        // @ts-ignore
        if (formatEther(userUsdcAllowance) < Number(usdcAmount)) return "Approve USDC"
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

                {/* ETH Input Block */}
                <div className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700/50 hover:border-gray-600/50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">You deposit</span>
                        {isConnected && (
                            <button 
                                onClick={() => {
                                    if (userEthBalance) {
                                        const balance = formatEther(userEthBalance as bigint);
                                        setEthAmount(balance);
                                        setActiveTab("eth");
                                    }
                                }}
                                className="text-xs text-gray-500 hover:text-white transition-colors"
                            >
                                Balance: {userEthBalance ? parseFloat(formatEther(userEthBalance as bigint)).toFixed(4) : "0"}
                            </button>
                        )}
                    </div>
                    <div className="flex items-center justify-between gap-4">
                        <input
                            type="number"
                            value={ethAmount}
                            onChange={ethHandler}
                            className="w-full bg-transparent text-3xl font-medium text-white outline-none placeholder-gray-600"
                            placeholder="0"
                        />
                        <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-gray-700/80">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                                <span className="text-white text-xs font-bold">Ξ</span>
                            </div>
                            <span className="font-semibold text-white">ETH</span>
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

                {/* USDC Input Block */}
                <div className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700/50 hover:border-gray-600/50 transition-colors mt-1">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">You deposit</span>
                        {isConnected && (
                            <button 
                                onClick={() => {
                                    if (userUsdcBalance && usdcInputRef.current && !usdcInputRef.current.disabled) {
                                        const balance = formatEther(userUsdcBalance as bigint);
                                        setUsdcAmount(balance);
                                        setActiveTab("usdc");
                                    }
                                }}
                                className="text-xs text-gray-500 hover:text-white transition-colors"
                            >
                                Balance: {userUsdcBalance ? parseFloat(formatEther(userUsdcBalance as bigint)).toFixed(2) : "0"}
                            </button>
                        )}
                    </div>
                    <div className="flex items-center justify-between gap-4">
                        <input
                            type="number"
                            ref={usdcInputRef}
                            value={usdcAmount}
                            onChange={usdcHandler}
                            className="w-full bg-transparent text-3xl font-medium text-white outline-none placeholder-gray-600 disabled:text-gray-500"
                            placeholder="0"
                        />
                        <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-gray-700/80">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                <span className="text-white text-xs font-bold">$</span>
                            </div>
                            <span className="font-semibold text-white">USDC</span>
                        </div>
                    </div>
                </div>

                {/* Expected Shares Info */}
                {ethAmount && usdcAmount && (
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
                    disabled={getButtonText() !== "Stake Tokens" && getButtonText() !== "Approve Eth" && getButtonText() !== "Approve USDC"}
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