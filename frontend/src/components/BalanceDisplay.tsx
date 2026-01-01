import { useWeb3 } from '../context/Web3Context';

export const BalanceDisplay = () => {
  const { isConnected } = useWeb3();

  if (!isConnected) {
    return null;
  }

  return (
    <div className="glass rounded-2xl p-6 border border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300 hover:border-white/20">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white">Your Balances</h2>
      </div>
      <div className="space-y-3">
        <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
            <span className="text-gray-300">ETH</span>
          </div>
          <span className="text-white font-semibold">0.0000</span>
        </div>
        <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
            <span className="text-gray-300">USDC</span>
          </div>
          <span className="text-white font-semibold">0.0000</span>
        </div>
        <div className="flex justify-between items-center pt-3 border-t border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse-glow"></div>
            <span className="text-gray-300">LP Tokens (ANC)</span>
          </div>
          <span className="text-green-400 font-semibold">0.0000</span>
        </div>
      </div>
    </div>
  );
};
