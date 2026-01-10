import { createConfig, http, injected } from 'wagmi'
import { sepolia } from 'wagmi/chains'

export const config = createConfig({
  connectors: [injected()],
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(),
  },
})