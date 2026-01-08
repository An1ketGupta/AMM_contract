import { createConfig, http, injected } from 'wagmi'
import { foundry } from 'wagmi/chains'

export const config = createConfig({
  chains: [foundry],
  connectors: [injected()],
  transports: {
    [foundry.id]: http(),
  },
})