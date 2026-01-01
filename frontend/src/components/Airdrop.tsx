import { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';

export const Airdrop = () => {
  const { isConnected } = useWeb3();
  const [amount, setAmount] = useState('');

  const handleAirdrop = () => {
    // TODO: Implement airdrop functionality
    console.log('Airdrop clicked', { amount });
  };

  return (
    <div className="glass rounded-2xl p-6 border border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300 hover:border-white/20">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white">Get ETH Tokens</h2>
      </div>
      <p className="text-gray-300 text-sm mb-6 flex items-center gap-2">
        <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Request an airdrop of ETH tokens for testing
      </p>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-gray-300 text-sm font-medium block">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="100"
            className="w-full bg-gradient-to-br from-gray-900/50 to-gray-800/50 text-white rounded-xl p-4 border-2 border-white/10 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
          />
        </div>

        {!isConnected ? (
          <button
            disabled
            className="w-full py-3 bg-gray-700/50 text-gray-400 rounded-xl font-semibold cursor-not-allowed border border-gray-600/50"
          >
            Connect Wallet
          </button>
        ) : (
          <button
            onClick={handleAirdrop}
            disabled={!amount || parseFloat(amount) <= 0}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg glow-hover disabled:glow-0"
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Request Airdrop
            </span>
          </button>
        )}
      </div>
    </div>
  );
};
