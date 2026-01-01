import { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';

export const AddLiquidity = () => {
  const { isConnected, connectWallet } = useWeb3();
  const [ethAmount, setEthAmount] = useState('');
  const [usdcAmount, setUsdcAmount] = useState('');

  const handleAddLiquidity = () => {
    // TODO: Implement add liquidity functionality
    console.log('Add liquidity clicked', { ethAmount, usdcAmount });
  };

  const handleMax = (token: 'eth' | 'usdc') => {
    // TODO: Implement max amount
    console.log('Max clicked for', token);
  };

  return (
    <div className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700 p-6">
      <h2 className="text-2xl font-semibold text-white mb-6">Add Liquidity</h2>
      
      <div className="space-y-4">
        {/* ETH Input */}
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-700">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">ETH</span>
            {isConnected && (
              <button
                onClick={() => handleMax('eth')}
                className="text-xs text-blue-400 hover:text-blue-300 font-medium"
              >
                Max
              </button>
            )}
          </div>
          <div className="flex items-center justify-between">
            <input
              type="number"
              value={ethAmount}
              onChange={(e) => setEthAmount(e.target.value)}
              placeholder="0.0"
              className="bg-transparent text-2xl font-semibold text-white w-full outline-none placeholder-gray-600"
            />
            <button className="flex items-center gap-2 px-3 py-2 bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full"></div>
              <span className="font-semibold text-white">ETH</span>
            </button>
          </div>
          {isConnected && (
            <div className="mt-2 text-xs text-gray-500">
              Balance: 0.0000
            </div>
          )}
        </div>

        {/* Plus Icon */}
        <div className="flex justify-center -my-2">
          <div className="bg-gray-800 border-2 border-gray-700 rounded-full p-1">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
        </div>

        {/* USDC Input */}
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-700">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">USDC</span>
            {isConnected && (
              <button
                onClick={() => handleMax('usdc')}
                className="text-xs text-blue-400 hover:text-blue-300 font-medium"
              >
                Max
              </button>
            )}
          </div>
          <div className="flex items-center justify-between">
            <input
              type="number"
              value={usdcAmount}
              onChange={(e) => setUsdcAmount(e.target.value)}
              placeholder="0.0"
              className="bg-transparent text-2xl font-semibold text-white w-full outline-none placeholder-gray-600"
            />
            <button className="flex items-center gap-2 px-3 py-2 bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
              <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full"></div>
              <span className="font-semibold text-white">USDC</span>
            </button>
          </div>
          {isConnected && (
            <div className="mt-2 text-xs text-gray-500">
              Balance: 0.0000
            </div>
          )}
        </div>

        {/* Pool Info */}
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-700 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Share of Pool</span>
            <span className="text-white font-medium">0%</span>
          </div>
        </div>

        {/* Action Button */}
        {!isConnected ? (
          <button
            onClick={connectWallet}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors"
          >
            Connect Wallet
          </button>
        ) : (
          <button
            onClick={handleAddLiquidity}
            disabled={!ethAmount || !usdcAmount || parseFloat(ethAmount) <= 0 || parseFloat(usdcAmount) <= 0}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-colors"
          >
            Add Liquidity
          </button>
        )}
      </div>
    </div>
  );
};
