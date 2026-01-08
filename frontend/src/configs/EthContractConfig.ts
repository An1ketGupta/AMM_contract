import { ETH_ABI } from "../abis/ETH_ABI";

export const EthContractConfig = {
  address: import.meta.env.VITE_ETH_ADDRESS,
  abi:  ETH_ABI,
} as const