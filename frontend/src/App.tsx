import { useState } from 'react';
import { Web3Provider } from './context/Web3Context';
import { WalletButton } from './components/WalletButton';
import { Swap } from './components/Swap';
import { AddLiquidity } from './components/AddLiquidity';
import { RemoveLiquidity } from './components/RemoveLiquidity';

type Tab = 'swap' | 'liquidity' | 'remove';

function AppContent() {
  const [activeTab, setActiveTab] = useState<Tab>('swap');

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-xl font-semibold text-white">AMM</span>
            </div>
            <div className="flex items-center gap-4">
              <nav className="hidden md:flex items-center gap-1">
                <button
                  onClick={() => setActiveTab('swap')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'swap'
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  Swap
                </button>
                <button
                  onClick={() => setActiveTab('liquidity')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'liquidity'
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  Pool
                </button>
              </nav>
              <WalletButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-lg mx-auto">
          {/* Tab Content */}
          {activeTab === 'swap' && <Swap />}
          {activeTab === 'liquidity' && (
            <div className="space-y-4">
              <AddLiquidity />
              <RemoveLiquidity />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Web3Provider>
      <AppContent />
    </Web3Provider>
  );
}
