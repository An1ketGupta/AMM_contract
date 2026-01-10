import { GULU_ABI } from "../abis/GULU_ABI";

export const GuluContractConfig = {
    address : import.meta.env.VITE_GULU_ADDRESS,
    abi: GULU_ABI
} as const