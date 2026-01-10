import { useReadContract } from "wagmi"
import { EthContractConfig } from "../configs/EthContractConfig"
import { useEffect, useState, forwardRef, useImperativeHandle } from "react"
import { UsdcContractConfig } from "../configs/USDCContractConfig";

export interface PoolSupplyHandle {
    refetchPoolSupply: () => void;
}

const PoolSupply = forwardRef<PoolSupplyHandle, {}>((props, ref) => {
    const [ethSupply, setEthSupply] = useState(0);
    const [usdcSupply, setUsdcSupply] = useState(0);

    const { data: supplyEth, refetch: refetchEth } = useReadContract({
        ...EthContractConfig,
        functionName: "balanceOf",
        args:[
            import.meta.env.VITE_AMM_ADDRESS
        ]
    })

    const { data: supplyUsdc, refetch: refetchUsdc } = useReadContract({
        ...UsdcContractConfig,
        functionName: "balanceOf",
        args:[
            import.meta.env.VITE_AMM_ADDRESS
        ]
    })

    useImperativeHandle(ref, () => ({
        refetchPoolSupply: () => {
            refetchEth();
            refetchUsdc();
        }
    }));

    useEffect(() => {
        const supplyEthNum = Number(supplyEth)
        if (supplyEth) setEthSupply(supplyEthNum/1e18)
    }, [supplyEth])

    useEffect(() => {
        const supplyUsdcNum = Number(supplyUsdc)
        if (supplyUsdc) setUsdcSupply(supplyUsdcNum/1e18)
    }, [supplyUsdc])


    return (
        <div>
            <div>
                ETH in the Pool: {ethSupply ? ethSupply.toString() : "Loading..."}
            </div>
            <div>
                USDC in the pool: {usdcSupply ? usdcSupply.toString() : "Loading..."}
            </div>
        </div>
    )
})

export default PoolSupply;