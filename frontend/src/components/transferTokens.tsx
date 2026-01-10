import { useEffect, useState } from "react";
import { useConnection, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { AmmContractConfig } from "../configs/AMMContractConfig";
import { formatEther, parseEther } from "viem";
import { EthContractConfig } from "../configs/EthContractConfig";
import { UsdcContractConfig } from "../configs/USDCContractConfig";

type TradeDirection = "ethToUsdc" | "usdcToEth";

export default function TransferTokens() {
    const [tradeDirection, setTradeDirection] = useState<TradeDirection>("ethToUsdc");
    const { address, isConnected } = useConnection();
    const [inputAmount, setInputAmount] = useState("");
    const [outputAmount, setOutputAmount] = useState("");

    const { data: hash, writeContract, isPending: isWritePending } = useWriteContract();
    
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash,
    });

    const { data: expectedUsdcAmount, isLoading: loadingUsdc } = useReadContract({
        ...AmmContractConfig,
        functionName: "GetUsdcAmountForEth",
        args: [inputAmount ? parseEther(inputAmount) : 0n],
        query: { enabled: tradeDirection === "ethToUsdc" && inputAmount !== "" }
    });

    const { data: expectedEthAmount, isLoading: loadingEth } = useReadContract({
        ...AmmContractConfig,
        functionName: "GetEthAmountForUsdc",
        args: [inputAmount ? parseEther(inputAmount) : 0n],
        query: { enabled: tradeDirection === "usdcToEth" && inputAmount !== "" }
    });

    const { data: userEthAllowance, refetch: refetchEthAllowance } = useReadContract({
        ...EthContractConfig,
        functionName: "allowance",
        args: [address!, import.meta.env.VITE_AMM_ADDRESS],
        query: { enabled: address!=undefined }
    });

    const { data: userUsdcAllowance, refetch: refetchUsdcAllowance } = useReadContract({
        ...UsdcContractConfig,
        functionName: "allowance",
        args: [address!, import.meta.env.VITE_AMM_ADDRESS],
        query: { enabled: address!=undefined }
    });

    useEffect(() => {
        if (inputAmount === "") {
            setOutputAmount("");
            return;
        }
        if (tradeDirection === "ethToUsdc" && expectedUsdcAmount) {
            setOutputAmount(formatEther(expectedUsdcAmount));
        } else if (tradeDirection === "usdcToEth" && expectedEthAmount) {
            setOutputAmount(formatEther(expectedEthAmount));
        }
    }, [expectedUsdcAmount, expectedEthAmount, tradeDirection, inputAmount]);

    useEffect(() => {
        if (isConfirmed) {
            refetchEthAllowance();
            refetchUsdcAllowance();
        }
    }, [isConfirmed, refetchEthAllowance, refetchUsdcAllowance]);


    const handleDirectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setTradeDirection(e.target.value as TradeDirection);
        setInputAmount("");
        setOutputAmount("");
    };

    const parsedInput = inputAmount ? parseEther(inputAmount) : 0n;
    const currentEthAllowance = userEthAllowance ?? 0n;
    const currentUsdcAllowance = userUsdcAllowance ?? 0n;

    function transferHandler() {
        if (!address) return;

        if (tradeDirection === "ethToUsdc") {
            if (currentEthAllowance < parsedInput) {
                writeContract({
                    ...EthContractConfig,
                    functionName: "approve",
                    args: [import.meta.env.VITE_AMM_ADDRESS, parsedInput]
                });
            } else {
                writeContract({
                    ...AmmContractConfig,
                    functionName: "swapEthtoUsdc",
                    args: [parsedInput, 0n] // 0n is minAmountOut (slippage protection)
                });
            }
        } else {
            if (currentUsdcAllowance < parsedInput) {
                writeContract({
                    ...UsdcContractConfig,
                    functionName: "approve",
                    args: [import.meta.env.VITE_AMM_ADDRESS, parsedInput]
                });
            } else {
                writeContract({
                    ...AmmContractConfig,
                    functionName: "swapUsdcToEth",
                    args: [parsedInput, 0n]
                });
            }
        }
    }

    const getButtonText = () => {
        if (!isConnected) return "Connect Wallet";
        if (isWritePending || isConfirming) return "Transaction Pending...";
        
        if (tradeDirection === "ethToUsdc") {
            return currentEthAllowance < parsedInput ? "Approve ETH" : "Swap ETH to USDC";
        } else {
            return currentUsdcAllowance < parsedInput ? "Approve USDC" : "Swap USDC to ETH";
        }
    };

    const isQuoteLoading = loadingUsdc || loadingEth;
    const isTransacting = isWritePending || isConfirming;

    const inputLabel = tradeDirection === "ethToUsdc" ? "ETH (You Pay)" : "USDC (You Pay)";
    const outputLabel = tradeDirection === "ethToUsdc" ? "USDC (You Receive)" : "ETH (You Receive)";

    return (
        <div className="flex flex-col gap-4 text-black w-full max-w-md mx-auto p-6 bg-white shadow-lg rounded-xl">
            <h2 className="text-xl font-bold mb-2">Swap Tokens</h2>

            <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-600">I want to swap:</label>
                <select
                    value={tradeDirection}
                    onChange={handleDirectionChange}
                    className="p-3 border rounded bg-gray-50 cursor-pointer"
                >
                    <option value="ethToUsdc">ETH to USDC</option>
                    <option value="usdcToEth">USDC to ETH</option>
                </select>
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-600">{inputLabel}</label>
                <input
                    type="number"
                    className="p-4 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="0.0"
                    value={inputAmount}
                    onChange={(e) => setInputAmount(e.target.value)}
                />
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-600">{outputLabel}</label>
                <input
                    type="text"
                    className="p-4 border rounded bg-gray-100 text-gray-500 cursor-not-allowed"
                    placeholder="0.0"
                    value={isQuoteLoading ? "Calculating..." : outputAmount}
                    readOnly
                    disabled
                />
            </div>

            <button
                onClick={transferHandler}
                disabled={!isConnected || inputAmount === "" || isTransacting}
                className={`p-4 rounded font-bold text-white transition-colors mt-2 ${
                    !isConnected || inputAmount === "" || isTransacting
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                }`}
            >
                {getButtonText()}
            </button>
        </div>
    );
}