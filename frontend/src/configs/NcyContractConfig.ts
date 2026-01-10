import { NCY_ABI } from "../abis/NCY_ABI";

export const NcyContractConfig = {
  address: import.meta.env.VITE_NCY_ADDRESS,
  abi:  NCY_ABI,
} as const