import * as React from 'react'
import { createPortal } from 'react-dom'
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
    icon: '🦊',
    color: 'from-orange-400 to-orange-600',
  },
  {
    id: 'coinbase',
    name: 'Coinbase',
    connector: coinbaseWallet({
      appName: 'AniSwap',
    }),
    icon: '💠',
    color: 'from-blue-400 to-blue-600',
  },
  {
    id: 'walletconnect',
    name: 'WalletConnect',
    connector: walletConnect({
      projectId: import.meta.env.VITE_WC_PROJECT_ID,
    }),
    icon: '🔗',
    color: 'from-purple-400 to-blue-500',
  },
]

export function WalletOptions() {
  const { connect, isPending, error } = useConnect()
  const [showModal, setShowModal] = React.useState(false)

  const modalContent = showModal ? (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => setShowModal(false)}
      />
      
      {/* Modal Content */}
      <div className="relative bg-gray-900 border border-gray-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Connect Wallet</h2>
          <button
            onClick={() => setShowModal(false)}
            className="p-2 hover:bg-gray-800 rounded-xl transition-colors"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-3">
          {wallets.map((wallet) => (
            <button
              key={wallet.id}
              disabled={isPending}
              onClick={() => {
                connect({ connector: wallet.connector });
                setShowModal(false);
              }}
              className="w-full flex items-center gap-4 p-4 bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 hover:border-gray-600 rounded-2xl transition-all duration-200 group"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${wallet.color} flex items-center justify-center text-xl shadow-lg`}>
                {wallet.icon}
              </div>
              <span className="text-white font-medium group-hover:text-pink-400 transition-colors">
                {wallet.name}
              </span>
              <svg className="w-5 h-5 text-gray-600 group-hover:text-gray-400 ml-auto transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-red-400 text-sm">{error.message}</p>
          </div>
        )}

        <p className="mt-6 text-center text-gray-500 text-xs">
          By connecting, you agree to the Terms of Service
        </p>
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        disabled={isPending}
        className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-semibold px-6 py-2.5 rounded-2xl transition-all duration-200 shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40"
      >
        {isPending ? 'Connecting...' : 'Connect Wallet'}
      </button>

      {/* Render modal at document body level using Portal */}
      {modalContent && createPortal(modalContent, document.body)}
    </>
  )
}
