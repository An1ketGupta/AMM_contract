import { useConnection, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi"
import { ETH_ABI } from "../abis/ETH_ABI";
import { USDC_ABI } from "../abis/USDC_ABI";
import { UsdcContractConfig } from "../configs/USDCContractConfig";
import { AmmContractConfig } from "../configs/AMMContractConfig";
import { EthContractConfig } from "../configs/EthContractConfig";
import { useEffect, useState } from "react";

export default function GetAirdrop() {
  const { data: hash, writeContract } = useWriteContract();
  const { address, isConnected } = useConnection()
  const [ buttonClicked, setButtonClicked ] = useState<"ETH" | "USDC" |"">("")
  const { data: receipt } = useWaitForTransactionReceipt({
    hash
  });

  async function GetEthAirdrop() {
    setButtonClicked("ETH")
    writeContract({
      address: import.meta.env.VITE_ETH_ADDRESS,
      abi: ETH_ABI,
      functionName: '_requestAirdrop',
      args: [BigInt(1000000000000000000)],
    },{
      onError:()=>{
        setButtonClicked("")
        alert("You cancelled the transaction")
      }
    })
  }

  async function GetUsdcAirdrop() {
    setButtonClicked("USDC")
    writeContract({
      address: import.meta.env.VITE_USDC_ADDRESS,
      abi: USDC_ABI,
      functionName: '_requestAirdrop',
      args: [BigInt(1000000000000000000)],
    },{
      onError:()=>{
        setButtonClicked("")
        alert("You cancelled the transaction")
      }
    })
  }

  const { data: ethBalance , refetch:refetchUserEthBalance } = useReadContract({
    ...EthContractConfig,
    functionName: "balanceOf",
    args: [
      // @ts-ignore
      address
    ],
    query: {
      enabled: isConnected
    }
  })

  const { data: usdcBalance , refetch:refetchUserUsdcBalance } = useReadContract({
    ...UsdcContractConfig,
    functionName: "balanceOf",
    args: [
      // @ts-ignore
      address
    ],
    query: {
      enabled: isConnected
    }
  })

  const { data: ancBalance , refetch:refetchUserANCBalance } = useReadContract({
    ...AmmContractConfig,
    functionName: "balanceOf",
    args: [
      // @ts-ignore
      address
    ], query: {
      enabled: isConnected
    }
  })

  useEffect(()=>{
    if(receipt?.status == "success"){
      alert(`Successfully airdropped 1 ${buttonClicked}`)
      setButtonClicked("")
    }
    refetchUserANCBalance()
    refetchUserEthBalance()
    refetchUserUsdcBalance()
  },[receipt])

  function getEthButtonText() {
    if (isConnected) {
      return "Get Eth Airdrop"
    }
    return "Connect Wallet"
  }

  function getUsdcButtonText() {
    if (isConnected) {
      return "Get Usdc Airdrop"
    }
    return "Connect Wallet"
  }


  return <div className="flex flex-col items-center">
    <div className="flex gap-2">
      <button onClick={GetEthAirdrop} disabled={getEthButtonText() == "Connect Wallet"} className="bg-gray-500 p-3 mr-4 rounded-lg">{getEthButtonText()}</button>
      <button onClick={GetUsdcAirdrop} disabled={getUsdcButtonText() == "Connect Wallet"} className="bg-gray-500 p-3 mr-4 rounded-lg">{getUsdcButtonText()}</button>
    </div>
  </div>
}