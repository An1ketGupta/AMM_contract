import { useConnection, useReadContract } from "wagmi";
import { formatEther } from "viem";
import { UsdcContractConfig } from "../configs/USDCContractConfig";

export default function ShowUserBalance(){
    const { address , isConnected } = useConnection()
    const { data:ethBalance } = useReadContract({
        ...UsdcContractConfig,
        functionName:"balanceOf",
        args:[
            // @ts-ignore
            address
        ],
        query:{
            enabled: isConnected
        }
    })
    
    const { data:usdcBalance } = useReadContract({
        ...UsdcContractConfig,
        functionName:"balanceOf",
        args:[
            // @ts-ignore
            address
        ]
    })

    return <div className="flex gap-4">
        <div>
            EthBalance: {ethBalance?formatEther(ethBalance):"0"}
        </div>
        <div>
            UsdcBalance: {usdcBalance?formatEther(usdcBalance):"0"}
        </div>
    </div>
}