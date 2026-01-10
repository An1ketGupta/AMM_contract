import { useReadContract } from "wagmi"
import { NcyContractConfig } from "../configs/NcyContractConfig"
import { useEffect, useState, forwardRef, useImperativeHandle } from "react"
import { GuluContractConfig } from "../configs/GuluContractConfig";

export interface PoolSupplyHandle {
    refetchPoolSupply: () => void;
}

const PoolSupply = forwardRef<PoolSupplyHandle, {}>(({}, ref) => {
    const [ncySupply, setNcySupply] = useState(0);
    const [guluSupply, setGuluSupply] = useState(0);

    const { data: supplyNcy, refetch: refetchNcy } = useReadContract({
        ...NcyContractConfig,
        functionName: "balanceOf",
        args:[
            import.meta.env.VITE_AMM_ADDRESS
        ]
    })

    const { data: supplyGulu, refetch: refetchGulu } = useReadContract({
        ...GuluContractConfig,
        functionName: "balanceOf",
        args:[
            import.meta.env.VITE_AMM_ADDRESS
        ]
    })

    useImperativeHandle(ref, () => ({
        refetchPoolSupply: () => {
            refetchNcy();
            refetchGulu();
        }
    }));

    useEffect(() => {
        const supplyNcyNum = Number(supplyNcy)
        if (supplyNcy) setNcySupply(supplyNcyNum/1e18)
    }, [supplyNcy])

    useEffect(() => {
        const supplyGuluNum = Number(supplyGulu)
        if (supplyGulu) setGuluSupply(supplyGuluNum/1e18)
    }, [supplyGulu])


    return (
        <div className="w-full">
            <div className="flex items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 rounded-xl border border-gray-700/50">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                        <span className="text-white text-[10px] font-bold">N</span>
                    </div>
                    <span className="text-gray-400">Pool NCY:</span>
                    <span className="text-white font-semibold">
                        {ncySupply ? ncySupply.toFixed(4) : "0"}
                    </span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 rounded-xl border border-gray-700/50">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                        <span className="text-white text-[10px] font-bold">G</span>
                    </div>
                    <span className="text-gray-400">Pool GULU:</span>
                    <span className="text-white font-semibold">
                        {guluSupply ? guluSupply.toFixed(2) : "0"}
                    </span>
                </div>
            </div>
        </div>
    )
})

export default PoolSupply;