import { USDC_ABI } from "../abis/USDC_ABI";

export const UsdcContractConfig = {
    address : import.meta.env.VITE_USDC_ADDRESS,
    abi: USDC_ABI
} as const