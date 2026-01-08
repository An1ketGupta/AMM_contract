import { useWriteContract } from "wagmi"
import { ETH_ABI } from "../abis/ETH_ABI";
import { USDC_ABI } from "../abis/USDC_ABI";

export default function GetAirdrop() {
  const { data:hash , writeContract } = useWriteContract();
  
  async function GetEthAirdrop(){
      const ETH_ADDRESS = import.meta.env.VITE_ETH_ADDRESS
      writeContract({
        address: ETH_ADDRESS,
        abi:ETH_ABI,
        functionName: '_requestAirdrop',
        args: [BigInt(1000000000000000000)],
      })
      console.log(hash)
    }
    
    async function GetUsdcAirdrop(){
      const USDC_ADDRESS = import.meta.env.VITE_USDC_ADDRESS
      writeContract({
        address: USDC_ADDRESS,
        abi:USDC_ABI,
        functionName: '_requestAirdrop',
        args: [BigInt(1000000000000000000)],
      })
      console.log(hash)
    }

return <div className="flex gap-2">
        <button onClick={GetEthAirdrop} className="bg-gray-500 p-3 mr-4 rounded-lg">Get ETH Airdrop</button>
        <button onClick={GetUsdcAirdrop} className="bg-gray-500 p-3 mr-4 rounded-lg">Get USDC Airdrop</button>
        <div>{hash && <div>Transaction Hash: {hash}</div>}</div>
    </div>
}