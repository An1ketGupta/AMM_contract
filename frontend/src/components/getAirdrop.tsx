import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi"
import { NCY_ABI } from "../abis/NCY_ABI";
import { GULU_ABI } from "../abis/GULU_ABI";
import { GuluContractConfig } from "../configs/GuluContractConfig";
import { AmmContractConfig } from "../configs/AMMContractConfig";
import { NcyContractConfig } from "../configs/NcyContractConfig";
import { useEffect, useState } from "react";
import { formatEther } from "viem";
import { useToast } from "./Toast";

export default function GetAirdrop() {
  const { data: hash, writeContract } = useWriteContract();
  const { address, isConnected } = useAccount()
  const [ buttonClicked, setButtonClicked ] = useState<"NCY" | "GULU" |"">("")
  const { data: receipt } = useWaitForTransactionReceipt({
    hash
  });
  const toast = useToast();

  async function GetNcyAirdrop() {
    setButtonClicked("NCY")
    writeContract({
      address: import.meta.env.VITE_NCY_ADDRESS,
      abi: NCY_ABI,
      functionName: '_requestAirdrop'
    },{
      onError:()=>{
        setButtonClicked("")
        toast.warning("Transaction cancelled")
      }
    })
  }

  async function GetGuluAirdrop() {
    setButtonClicked("GULU")
    writeContract({
      address: import.meta.env.VITE_GULU_ADDRESS,
      abi: GULU_ABI,
      functionName: '_requestAirdrop'
    },{
      onError:()=>{
        setButtonClicked("")
        toast.warning("Transaction cancelled")
      }
    })
  }

  const { data: ncyBalance , refetch:refetchUserNcyBalance } = useReadContract({
    ...NcyContractConfig,
    functionName: "balanceOf",
    args: [
      // @ts-ignore
      address
    ],
    query: {
      enabled: isConnected
    }
  })

  const { data: guluBalance , refetch:refetchUserGuluBalance } = useReadContract({
    ...GuluContractConfig,
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
      toast.success(`Successfully airdropped 1 ${buttonClicked}!`)
      setButtonClicked("")
    }
    refetchUserANCBalance()
    refetchUserNcyBalance()
    refetchUserGuluBalance()
  },[receipt])

  function getNcyButtonText() {
    if (isConnected) {
      return "Get Ncy Airdrop"
    }
    return "Connect Wallet"
  }

  function getGuluButtonText() {
    if (isConnected) {
      return "Get Gulu Airdrop"
    }
    return "Connect Wallet"
  }


  return (
    <div className="w-full max-w-md">
      {/* Faucet Card */}
      <div className="bg-gray-900/60 backdrop-blur-xl rounded-3xl p-6 border border-gray-800/50 shadow-2xl">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white">Test Token Faucet</h3>
        </div>

        {/* Balances */}
        {isConnected && (
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-gray-800/50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">NCY</p>
              <p className="text-sm font-bold text-blue-400">
                {ncyBalance ? parseFloat(formatEther(ncyBalance as bigint)).toFixed(2) : "0"}
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">GULU</p>
              <p className="text-sm font-bold text-green-400">
                {guluBalance ? parseFloat(formatEther(guluBalance as bigint)).toFixed(2) : "0"}
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">ANC</p>
              <p className="text-sm font-bold text-purple-400">
                {ancBalance ? parseFloat(formatEther(ancBalance as bigint)).toFixed(4) : "0"}
              </p>
            </div>
          </div>
        )}

        {/* Airdrop Buttons */}
        <div className="flex gap-3">
          <button
            onClick={GetNcyAirdrop}
            disabled={getNcyButtonText() == "Connect Wallet" || buttonClicked === "NCY"}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-semibold text-sm transition-all duration-200 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-xs">N</span>
            </div>
            {buttonClicked === "NCY" ? "Claiming..." : "Get NCY"}
          </button>
          <button
            onClick={GetGuluAirdrop}
            disabled={getGuluButtonText() == "Connect Wallet" || buttonClicked === "GULU"}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-semibold text-sm transition-all duration-200 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg shadow-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-xs">G</span>
            </div>
            {buttonClicked === "GULU" ? "Claiming..." : "Get GULU"}
          </button>
        </div>

        <p className="mt-4 text-center text-gray-500 text-xs">
          Receive 1 test token per request for testing purposes
        </p>
      </div>
    </div>
  )
}