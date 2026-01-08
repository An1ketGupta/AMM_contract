import {  useEffect, useState } from "react"
import { AmmContractConfig } from "../configs/AMMContractConfig";
import { useReadContract } from "wagmi";
import { formatEther, parseEther } from "viem";

export default function StakeMoney() {
    const [ ethAmount , setEthAmount ] = useState<string>("")
    const [ usdcAmount , setUsdcAmount ] = useState<string>("")
    const [activeTab , setActiveTab] = useState<"eth"|"usdc"|"">("");
    
    const { data: usdcAmountRequired } = useReadContract({
        ...AmmContractConfig,
        functionName:"GetUsdcAmountRequired",
        args:[ethAmount ? BigInt(parseEther(ethAmount)) : 0n],
        query: {
            enabled : activeTab == "eth" && ethAmount != ""
        }
    })

    useEffect(()=>{
        if(usdcAmountRequired == BigInt(0)){
            console.log("No staked amount right now. Initialise pool")
        }
        // @ts-ignore
        else if(usdcAmountRequired > BigInt(0)){

        }
    },[usdcAmountRequired])
    
    const { data: ethAmountRequired } = useReadContract({
        ...AmmContractConfig,
        functionName:"GetEthAmountRequired",
        args:[usdcAmount ? BigInt(parseEther(usdcAmount)) : 0n],
        query: {
            enabled : activeTab == "usdc" && usdcAmount != ""
        }
    })
    
    useEffect(()=>{
        console.log(ethAmountRequired)
    },[ethAmountRequired])
    

    useEffect(()=>{
        if(usdcAmountRequired && activeTab == "eth")
        setUsdcAmount(formatEther(usdcAmountRequired).toString())
    },[usdcAmountRequired , activeTab])
    
    useEffect(()=>{
        if(ethAmountRequired && activeTab == "usdc")
        setEthAmount(formatEther(ethAmountRequired).toString())
    },[ethAmountRequired ,activeTab])

    function ethHandler(e:any){
        const value = e.target.value;
        setEthAmount(value);
        setActiveTab("eth")
        if(value == ""){
            setActiveTab("")
            setEthAmount("");
        } 
    }

    function usdcHandler(e:any){
        const value = e.target.value
        setActiveTab("usdc")
        setUsdcAmount(value)
        if(value == ""){
            setActiveTab("")
            setUsdcAmount("")
        } 
    }

    return <div className="text-black">
        <input type="number" value={ethAmount} onChange={ethHandler} placeholder="Enter the amount of the ETH" />
        <input type="number" value={usdcAmount} onChange={usdcHandler} placeholder="Enter the amount of the USDC" />
    </div>
}