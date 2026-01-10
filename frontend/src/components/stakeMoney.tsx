import { useEffect, useRef, useState } from "react"
import { AmmContractConfig } from "../configs/AMMContractConfig";
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { formatEther, parseEther } from "viem";
import { EthContractConfig } from "../configs/EthContractConfig";
import { UsdcContractConfig } from "../configs/USDCContractConfig";
import type { PoolSupplyHandle } from "./poolSupply";
import PoolSupply from "./poolSupply";

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
            alert(currentTransaction)
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
            alert(currentTransaction)
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
                        parseEther(Number(ethAmount).toString())
                    ]
                }, {
                    onError: () => {
                        setCurrentTransaction("")
                        alert("You cancelled the transaction")
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
                        parseEther(Number(usdcAmount).toString())
                    ]
                }, {
                    onError: () => {
                        setCurrentTransaction("")
                        alert("You cancelled the transaction")
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
                        alert("You cancelled the transaction")
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
        <div className="flex flex-col gap-4 text-black w-full max-w-4xl mx-auto">
            <PoolSupply ref={poolRef} />
            {/* --- NEW: Wallet Balances Section --- */}
            {isConnected && (
                <div className="grid grid-cols-3 gap-4 mb-2">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-center">
                        <p className="text-sm text-gray-500 font-semibold mb-1">ETH Balance</p>
                        <p className="text-lg font-bold text-blue-800 break-all">
                            {userEthBalance ? parseFloat(formatEther(userEthBalance as bigint)).toFixed(4) : "0"}
                        </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-100 text-center">
                        <p className="text-sm text-gray-500 font-semibold mb-1">USDC Balance</p>
                        <p className="text-lg font-bold text-green-800 break-all">
                            {userUsdcBalance ? parseFloat(formatEther(userUsdcBalance as bigint)).toFixed(2) : "0"}
                        </p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 text-center">
                        <p className="text-sm text-gray-500 font-semibold mb-1">ANC Balance</p>
                        <p className="text-lg font-bold text-purple-800 break-all">
                            {userANCBalance ? parseFloat(formatEther(userANCBalance as bigint)).toFixed(4) : "0"}
                        </p>
                    </div>
                </div>
            )}
            {/* ------------------------------------- */}

            <div className="flex gap-4">
                <input
                    type="number"
                    value={ethAmount}
                    onChange={ethHandler}
                    className="w-full p-2 border rounded"
                    placeholder="Enter ETH Amount"
                />
                <input
                    type="number"
                    ref={usdcInputRef}
                    value={usdcAmount}
                    onChange={usdcHandler}
                    className="w-full p-2 border rounded"
                    placeholder="Enter USDC Amount"
                />
                <button
                    disabled={getButtonText() !== "Stake Tokens" && getButtonText() !== "Approve Eth" && getButtonText() !== "Approve USDC"}
                    onClick={ButtonHandler}
                    className="bg-black text-white p-2 rounded-lg whitespace-nowrap min-w-[120px] hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {getButtonText()}
                </button>
            </div>

            {/* Display Expected Shares */}
            {ethAmount && usdcAmount && (
                <div className="p-4 bg-gray-100 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-600">Expected LP Tokens (ANC) to receive:</p>
                        <p className="text-xl font-bold text-indigo-600">
                            {expectedShares ? formatEther(expectedShares as bigint) : "0"} ANC
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}           