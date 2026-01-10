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
        <div className="w-full">
            <div className="flex items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 rounded-xl border border-gray-700/50">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                        <span className="text-white text-[10px] font-bold">Ξ</span>
                    </div>
                    <span className="text-gray-400">Pool ETH:</span>
                    <span className="text-white font-semibold">
                        {ethSupply ? ethSupply.toFixed(4) : "0"}
                    </span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 rounded-xl border border-gray-700/50">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                        <span className="text-white text-[10px] font-bold">$</span>
                    </div>
                    <span className="text-gray-400">Pool USDC:</span>
                    <span className="text-white font-semibold">
                        {usdcSupply ? usdcSupply.toFixed(2) : "0"}
                    </span>
                </div>
            </div>
        </div>
    )
})

export default PoolSupply;