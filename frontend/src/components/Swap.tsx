import { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';

export const Swap = () => {
  const { isConnected, connectWallet } = useWeb3();
  const [swapDirection, setSwapDirection] = useState<'ethToUsdc' | 'usdcToEth'>('ethToUsdc');
  const [inputAmount, setInputAmount] = useState('');
  const [outputAmount, setOutputAmount] = useState('');

  const handleSwap = () => {
    // TODO: Implement swap functionality
    console.log('Swap clicked', { swapDirection, inputAmount, outputAmount });
  };

  const handleMax = () => {
    // TODO: Implement max amount
    console.log('Max clicked');
  };

  const handleSwitch = () => {
    setSwapDirection(swapDirection === 'ethToUsdc' ? 'usdcToEth' : 'ethToUsdc');
    // Swap amounts
    const temp = inputAmount;
    setInputAmount(outputAmount);
    setOutputAmount(temp);
  };

  return (
    <div className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-white">Swap</h2>
        <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      <div className="space-y-4">
        {/* Input Token */}
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-700">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">From</span>
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
              value={inputAmount}
              onChange={(e) => setInputAmount(e.target.value)}
              placeholder="0.0"
              className="bg-transparent text-2xl font-semibold text-white w-full outline-none placeholder-gray-600"
            />
            <button className="flex items-center gap-2 px-3 py-2 bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full"></div>
              <span className="font-semibold text-white">
                {swapDirection === 'ethToUsdc' ? 'ETH' : 'USDC'}
              </span>
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          {isConnected && (
            <div className="mt-2 text-xs text-gray-500">
              Balance: 0.0000
            </div>
          )}
        </div>

        {/* Swap Button */}
        <div className="flex justify-center -my-2 relative z-10">
          <button
            onClick={handleSwitch}
            className="bg-gray-800 border-2 border-gray-700 rounded-full p-2 hover:border-gray-600 transition-colors shadow-lg"
          >
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
              />
            </svg>
          </button>
        </div>

        {/* Output Token */}
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-700">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">To</span>
          </div>
          <div className="flex items-center justify-between">
            <input
              type="text"
              value={outputAmount}
              onChange={(e) => setOutputAmount(e.target.value)}
              placeholder="0.0"
              className="bg-transparent text-2xl font-semibold text-white w-full outline-none placeholder-gray-600"
            />
            <button className="flex items-center gap-2 px-3 py-2 bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
              <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full"></div>
              <span className="font-semibold text-white">
                {swapDirection === 'ethToUsdc' ? 'USDC' : 'ETH'}
              </span>
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Swap Info */}
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-700 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Price</span>
            <span className="text-white font-medium">1 ETH = 2,500 USDC</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Minimum received</span>
            <span className="text-white font-medium">0.0</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Slippage tolerance</span>
            <span className="text-white font-medium">0.5%</span>
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
            onClick={handleSwap}
            disabled={!inputAmount || parseFloat(inputAmount) <= 0}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-colors"
          >
            Swap
          </button>
        )}
      </div>
    </div>
  );
};
