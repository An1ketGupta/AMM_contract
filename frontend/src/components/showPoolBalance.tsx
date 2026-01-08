import { useEffect, useState } from "react";
import { useConnection, useReadContract } from "wagmi";
import { AmmContractConfig } from "../configs/AMMContractConfig";
import { formatEther } from "viem";

export default function ShowPoolBalance(){
    const { address , isConnected } = useConnection()
    const [ balance , setBalance ] = useState('0')
    const { data:hash } = useReadContract({
        ...AmmContractConfig,
        functionName:"balanceOf",
        args:[
            // @ts-ignore
            address
        ]
    })

    return <div>
        Balance: {hash?formatEther(hash):"0"}
    </div>
}