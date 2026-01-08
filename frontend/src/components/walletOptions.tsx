import * as React from 'react'
import { useConnect } from 'wagmi'
import {
  injected,
  coinbaseWallet,
  walletConnect,
} from 'wagmi/connectors'

// Explicitly supported wallets
const wallets = [
  {
    id: 'metamask',
    name: 'MetaMask',
    connector: injected(),
  },
  {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    connector: coinbaseWallet({
      appName: 'My Dapp',
    }),
  },
  {
    id: 'walletconnect',
    name: 'WalletConnect',
    connector: walletConnect({
      projectId: import.meta.env.VITE_WC_PROJECT_ID,
    }),
  },
]

export function WalletOptions() {
  const { connect, isPending, error } = useConnect()

  return (
    <div style={{ display: 'flex', gap: '12px' }}>
      {wallets.map((wallet) => (
        <button
          key={wallet.id}
          disabled={isPending}
          onClick={() => connect({ connector: wallet.connector })}
        >
          {wallet.name}
        </button>
      ))}

      {error && <div style={{ color: 'red' }}>{error.message}</div>}
    </div>
  )
}
