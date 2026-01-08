import { AMM_ABI } from "../abis/AMM_ABI";

export const AmmContractConfig = {
  address: import.meta.env.VITE_AMM_ADDRESS,
  abi: AMM_ABI,
} as const;