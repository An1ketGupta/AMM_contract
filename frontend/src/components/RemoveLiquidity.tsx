import { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';

export const RemoveLiquidity = () => {
  const { isConnected, connectWallet } = useWeb3();
  const [lpAmount, setLpAmount] = useState('');

  const handleRemoveLiquidity = () => {
    // TODO: Implement remove liquidity functionality
    console.log('Remove liquidity clicked', { lpAmount });
  };

  const handleMax = () => {
    // TODO: Implement max amount
    console.log('Max clicked');
  };

  return (
    <div className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700 p-6">
      <h2 className="text-2xl font-semibold text-white mb-6">Remove Liquidity</h2>
      
      <div className="space-y-4">
        {/* LP Token Input */}
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-700">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">Amount</span>
            {isConnected && (
              <button
                onClick={handleMax}
                className="text-xs text-blue-400 hover:text-blue-300 font-medium"
              >
                Max
              </button>
            )}
          </div>
          <div className="flex items-center justify-between">
            <input
              type="number"
              value={lpAmount}
              onChange={(e) => setLpAmount(e.target.value)}
              placeholder="0.0"
              className="bg-transparent text-2xl font-semibold text-white w-full outline-none placeholder-gray-600"
            />
            <button className="flex items-center gap-2 px-3 py-2 bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
              <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full"></div>
              <span className="font-semibold text-white">ANC</span>
            </button>
          </div>
          {isConnected && (
            <div className="mt-2 text-xs text-gray-500">
              Balance: 0.0000
            </div>
          )}
        </div>

        {/* Output Info */}
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-700 space-y-3">
          <div className="text-sm text-gray-400 mb-2">You will receive:</div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full"></div>
              <span className="text-white font-medium">ETH</span>
            </div>
            <span className="text-white font-semibold">0.0000</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full"></div>
              <span className="text-white font-medium">USDC</span>
            </div>
            <span className="text-white font-semibold">0.0000</span>
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
            onClick={handleRemoveLiquidity}
            disabled={!lpAmount || parseFloat(lpAmount) <= 0}
            className="w-full py-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-colors"
          >
            Remove Liquidity
          </button>
        )}
      </div>
    </div>
  );
};
