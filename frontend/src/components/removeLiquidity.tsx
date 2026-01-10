import { useEffect, useState } from "react"
import { useConnection, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi"
import { AmmContractConfig } from "../configs/AMMContractConfig";
import { parseEther } from "viem";
import { EthContractConfig } from "../configs/EthContractConfig";
import { UsdcContractConfig } from "../configs/USDCContractConfig";

export default function RemoveLiquidity() {
    const [ANCTokens, setANCTokens] = useState<string>("")
    const { address } = useConnection();
    const { data:hash, writeContract } = useWriteContract();
    const { data:receipt } = useWaitForTransactionReceipt({
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
    
    const { data: userEthBalance , refetch: refetchEthBalance } = useReadContract({
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
    
    const { data: userUsdcBalance , refetch: refetchUsdcBalance } = useReadContract({
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

    useEffect(()=>{
        if(receipt?.status == "success"){
            alert("Successfull Removed Liquidity")
            refetchANCBalance()
            refetchEthBalance()
            refetchUsdcBalance()
        }
        if(receipt?.status == "reverted"){
            alert("Failed")
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
                alert("Transaction cancelled.")
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

    return <div className="flex w-auto gap-4 h-auto">
        <input onChange={inputHandler} value={ANCTokens} type="number" className="text-black w-full rounded-lg px-4" placeholder="Enter the amount of ANC tokens:" />
        <button onClick={RemoveLiquidityHandler} disabled={buttonHandler() != "Remove Liquidity"} className="px-4 rounded-lg bg-white text-black">{buttonHandler()}</button>
    </div>
}