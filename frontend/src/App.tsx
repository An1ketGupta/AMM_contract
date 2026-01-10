import { useConnection, WagmiProvider } from "wagmi";
import { config } from "./config";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import PoolSupply from "./components/poolSupply";
import GetAirdrop from "./components/getAirdrop";
import { Connection } from "./components/connection";
import { WalletOptions } from "./components/walletOptions";
import StakeMoney from "./components/stakeMoney";
import TransferTokens from "./components/transferTokens";
import RemoveLiquidity from "./components/removeLiquidity";

const queryclient = new QueryClient();

function ConnectWallet() {
  const { isConnected } = useConnection()
  if (isConnected) return <Connection/>
  return <WalletOptions/>
}

export default function App() {
  return <div className="py-10 bg-black min-h-screen text-white min-w-screen">
    <QueryClientProvider client={queryclient}>
      <WagmiProvider config={config}>
        <div className="pt-10 flex flex-col justify-center items-center gap-20">
          <ConnectWallet/>
          <PoolSupply/>
          <StakeMoney/>
          <TransferTokens/>
          <GetAirdrop/>
          <RemoveLiquidity/>
        </div>
      </WagmiProvider>
    </QueryClientProvider>

  </div>
}






