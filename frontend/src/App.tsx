import { useState } from "react";
import { useAccount, WagmiProvider } from "wagmi";
import { config } from "./config";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import GetAirdrop from "./components/getAirdrop";
import { Connection } from "./components/connection";
import { WalletOptions } from "./components/walletOptions";
import StakeMoney from "./components/stakeMoney";
import TransferTokens from "./components/transferTokens";
import RemoveLiquidity from "./components/removeLiquidity";
import { ToastProvider } from "./components/Toast";

const queryclient = new QueryClient();

function ConnectWallet() {
  const { isConnected } = useAccount()
  if (isConnected) return <Connection/>
  return <WalletOptions/>
}

type TabType = "swap" | "liquidity" | "remove";

function MainContent() {
  const [activeTab, setActiveTab] = useState<TabType>("swap");

  return (
    <div className="min-h-screen bg-[#0d0d0d] relative overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-[15%] w-72 h-72 bg-pink-500/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-40 right-[20%] w-64 h-64 bg-purple-500/15 rounded-full blur-[100px] animate-pulse delay-1000" />
        <div className="absolute bottom-32 left-[30%] w-80 h-80 bg-blue-500/10 rounded-full blur-[120px] animate-pulse delay-500" />
        <div className="absolute top-1/2 right-[10%] w-48 h-48 bg-green-500/10 rounded-full blur-[80px] animate-pulse delay-700" />
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-gray-800/50 backdrop-blur-sm bg-[#0d0d0d]/80">
        <div className="flex items-center gap-8">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-pink-500/25 overflow-hidden">
              <img src="/Logo.png" alt="AniSwap" className="w-full h-full object-cover" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
              AniSwap
            </span>
          </div>

          {/* Nav Tabs */}
          <div className="hidden md:flex items-center gap-1 bg-gray-900/50 p-1 rounded-2xl border border-gray-800/50">
            <button
              onClick={() => setActiveTab("swap")}
              className={`px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === "swap"
                  ? "bg-gray-800 text-white shadow-lg"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Swap
            </button>
            <button
              onClick={() => setActiveTab("liquidity")}
              className={`px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === "liquidity"
                  ? "bg-gray-800 text-white shadow-lg"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Pool
            </button>
            <button
              onClick={() => setActiveTab("remove")}
              className={`px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === "remove"
                  ? "bg-gray-800 text-white shadow-lg"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Withdraw
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-gray-900/80 rounded-xl px-3 py-2 border border-gray-700/50">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            <span className="text-gray-300 text-sm font-medium">Sepolia</span>
          </div>
          <ConnectWallet/>
        </div>
      </nav>

      {/* Mobile Tab Selector */}
      <div className="md:hidden flex justify-center pt-20 px-4">
        <div className="flex items-center gap-1 bg-gray-900/50 p-1 rounded-2xl border border-gray-800/50 w-full max-w-sm">
          <button
            onClick={() => setActiveTab("swap")}
            className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              activeTab === "swap"
                ? "bg-gray-800 text-white shadow-lg"
                : "text-gray-400"
            }`}
          >
            Swap
          </button>
          <button
            onClick={() => setActiveTab("liquidity")}
            className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              activeTab === "liquidity"
                ? "bg-gray-800 text-white shadow-lg"
                : "text-gray-400"
            }`}
          >
            Pool
          </button>
          <button
            onClick={() => setActiveTab("remove")}
            className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              activeTab === "remove"
                ? "bg-gray-800 text-white shadow-lg"
                : "text-gray-400"
            }`}
          >
            Withdraw
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center px-4 pt-4 md:pt-24 pb-20">
        {/* Hero Text */}
        <div className="text-center mb-8">
          <h1 className="text-4xl mt-6 md:text-5xl lg:text-6xl font-bold text-white mb-4">
            {activeTab === "swap" && "Swap anytime, anywhere."}
            {activeTab === "liquidity" && "Provide Liquidity."}
            {activeTab === "remove" && "Withdraw Liquidity."}
          </h1>
          <p className="text-gray-400 text-lg max-w-md mx-auto">
            {activeTab === "swap" && "Trade tokens instantly with minimal slippage"}
            {activeTab === "liquidity" && "Earn fees by providing liquidity to the pool"}
            {activeTab === "remove" && "Remove your liquidity and collect your tokens"}
          </p>
        </div>

        {/* Active Component */}
        <div className="w-full max-w-md">
          {activeTab === "swap" && <TransferTokens />}
          {activeTab === "liquidity" && <StakeMoney />}
          {activeTab === "remove" && <RemoveLiquidity />}
        </div>

        {/* Airdrop Hint Notification */}
        <div className="mt-8 flex flex-col items-center animate-bounce">
          <div className="bg-[#0d0d0d] border border-pink-500/30 rounded-xl px-5 py-3 backdrop-blur-sm shadow-lg shadow-pink-500/10">
            <div className="flex items-center gap-3 text-gray-300">
              <span className="text-sm font-medium">🎁 Want free tokens? Scroll down for Airdrop!</span>
              <svg 
                className="w-5 h-5 text-pink-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M19 14l-7 7m0 0l-7-7m7 7V3" 
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Airdrop Section */}
        <div className="mt-12">
          <GetAirdrop />
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryclient}>
      <WagmiProvider config={config}>
        <ToastProvider>
          <MainContent />
        </ToastProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}






