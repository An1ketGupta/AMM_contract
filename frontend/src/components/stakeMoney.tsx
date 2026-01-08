import { useEffect, useRef, useState } from "react"
import { AmmContractConfig } from "../configs/AMMContractConfig";
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { formatEther, parseEther } from "viem";
import { EthContractConfig } from "../configs/EthContractConfig";
import { UsdcContractConfig } from "../configs/USDCContractConfig";

export default function StakeMoney() {
    const [ethAmount, setEthAmount] = useState<string>("")
    const usdcInputRef = useRef<HTMLInputElement | null>(null)
    const [usdcAmount, setUsdcAmount] = useState<string>("")
    const [activeTab, setActiveTab] = useState<"eth" | "usdc" | "">("");
    const { address, isConnected } = useAccount();
    const [ isProcessing , setProccessing ] = useState(false)
    const { data: hash, writeContract, isPending: isWalletLoading, error: walletError } = useWriteContract()
    const { isLoading: isConfirming, isSuccess: isConfirmed, error: confirmError } = useWaitForTransactionReceipt({
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
        if (ethAmountRequired && activeTab == "eth") {
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

    useEffect(()=>{
        if(isConfirmed){
            setProccessing(false)
            console.log("Transaction mined.")
            refetchEthAllowance();
            refetchUsdcAllowance();
        }
        if(walletError || confirmError){
            setProccessing(false)
        }
    },[isConfirmed])

    function ButtonHandler() {
        if(!isProcessing){
            setProccessing(true)
            // @ts-ignore
            if (formatEther(userEthAllowance) < (Number(ethAmount))) {
                console.log("ETH allowance: ", userEthAllowance)
                // @ts-ignore
                writeContract({
                    ...EthContractConfig,
                    functionName: "approve",
                    args: [
                        // @ts-ignore
                        import.meta.env.VITE_AMM_ADDRESS,
                        parseEther(Number(ethAmount).toString())
                    ]
                })
            }
            // @ts-ignore
            else if (formatEther(userUsdcAllowance) < (Number(usdcAmount))) {
                console.log("USDC allowance: ", userUsdcAllowance)
                // @ts-ignore
                writeContract({
                    ...UsdcContractConfig,
                    functionName: "approve",
                    args: [
                        // @ts-ignore
                        import.meta.env.VITE_AMM_ADDRESS,
                        parseEther(Number(usdcAmount).toString())
                    ]
                })
            }
            else{
                writeContract({
                    ...AmmContractConfig,
                    functionName: "stake",
                    args: [
                        parseEther(ethAmount),
                        parseEther(usdcAmount),
                        0n
                    ]
                })
            }
        }
    }

    const getButtonText = () => {
        if (!isConnected) return "Connect Wallet";
        if (!ethAmount || !usdcAmount) return "Enter amount"
        // @ts-ignore
        if (formatEther(userEthAllowance) < Number(ethAmount)) return "Approve Eth"
        // @ts-ignore
        if (formatEther(userUsdcAllowance) < Number(usdcAmount)) return "Approve USDC"
        return "Stake Tokens"
    }



    return <div className="text-black flex gap-4">
        <input type="number" value={ethAmount} onChange={ethHandler} className="w-full" placeholder="Enter the amount of the ETH" />
        <input type="number" ref={usdcInputRef} value={usdcAmount} onChange={usdcHandler} placeholder="Enter the amount of the USDC" />
        <button disabled={getButtonText() !== "Stake Tokens" && getButtonText() !== "Approve Eth" && getButtonText() !== "Approve USDC"} onClick={ButtonHandler} className="bg-white p-2 rounded-lg">{getButtonText()}</button>
    </div>
}
