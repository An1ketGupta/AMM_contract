import { useReadContract } from "wagmi"
import { EthContractConfig } from "../configs/EthContractConfig"
import { useEffect, useState } from "react"
import { UsdcContractConfig } from "../configs/USDCContractConfig";

export default function TotalSupply() {
    const [ethSupply, setEthSupply] = useState(0);
    const [usdcSupply, setUsdcSupply] = useState(0);

    const { data: supplyEth } = useReadContract({
        ...EthContractConfig,
        functionName: "balanceOf",
        args:[
            import.meta.env.VITE_AMM_ADDRESS
        ]
    })

    const { data: supplyUsdc } = useReadContract({
        ...UsdcContractConfig,
        functionName: "balanceOf",
        args:[
            import.meta.env.VITE_AMM_ADDRESS
        ]
    })


    useEffect(() => {
        const supplyEthNum = Number(supplyEth)
        if (supplyEth) setEthSupply(supplyEthNum/1e18)
    }, [supplyEth])

    useEffect(() => {
        const supplyUsdcNum = Number(supplyUsdc)
        if (supplyUsdc) setUsdcSupply(supplyUsdcNum/1e18)
    }, [supplyUsdc])


    return <div>
        <div>
            ETH in the Pool: {ethSupply ? ethSupply.toString() : "Loading..."}
        </div>
        <div>
            USDC in the pool: {usdcSupply ? usdcSupply.toString() : "Loading..."}
        </div>
    </div>
}