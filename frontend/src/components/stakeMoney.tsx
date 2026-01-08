import { useEffect, useRef, useState } from "react"
import { AmmContractConfig } from "../configs/AMMContractConfig";
import { useAccount, useReadContract } from "wagmi";
import { formatEther, parseEther } from "viem";
import { EthContractConfig } from "../configs/EthContractConfig";
import { UsdcContractConfig } from "../configs/USDCContractConfig";

export default function StakeMoney() {
    const [ethAmount, setEthAmount] = useState<string>("")
    const usdcInputRef = useRef<HTMLInputElement | null>(null)
    const [usdcAmount, setUsdcAmount] = useState<string>("")
    const [activeTab, setActiveTab] = useState<"eth" | "usdc" | "">("");
    const { address, isConnected } = useAccount();
    const [ buttonText , setButtonText ] = useState("")

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

    const { data: userEthAllowance, refetch:refetchEthAllowance } = useReadContract({
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

    const { data: userUsdcAllowance , refetch: refetchUsdcAllowance} = useReadContract({
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

    function ButtonHandler(){
        if(!isConnected){
            const { data:hash , isLoading}
        }
    }

    const getButtonText = ()=>{
        if(!isConnected)    return "Connect Wallet";
        if(!ethAmount || !usdcAmount)   return "Enter amount"
        refetchEthAllowance()
        refetchUsdcAllowance()
        // @ts-ignore
        if(formatEther(userEthAllowance) < Number(ethAmount) || formatEther(userUsdcAllowance) < Number(usdcAmount))  return "Approve Tokens"
        return "Stake Tokens"
    }



    return <div className="text-black flex gap-4">
        <input type="number" value={ethAmount} onChange={ethHandler} className="w-full" placeholder="Enter the amount of the ETH" />
        <input type="number" ref={usdcInputRef} value={usdcAmount} onChange={usdcHandler} placeholder="Enter the amount of the USDC" />
        <button onClick={ButtonHandler} className="bg-white p-2 rounded-lg">{getButtonText()}</button>
    </div>
}
