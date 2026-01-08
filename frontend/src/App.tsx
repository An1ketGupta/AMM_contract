import { useConnection, WagmiProvider } from "wagmi";
import { config } from "./config";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import TotalSupply from "./components/totalSupplyDisplay";
import GetAirdrop from "./components/getAirdrop";
import { Connection } from "./components/connection";
import { WalletOptions } from "./components/walletOptions";
import StakeMoney from "./components/stakeMoney";
import ShowPoolBalance from "./components/showPoolBalance";
import ShowUserBalance from "./components/showUserBalance";

const queryclient = new QueryClient();

function ConnectWallet() {
  const { isConnected } = useConnection()
  if (isConnected) return <Connection/>
  return <WalletOptions/>
}

export default function App() {
  return <div className="bg-black min-h-screen text-white min-w-screen">
    <QueryClientProvider client={queryclient}>
      <WagmiProvider config={config}>
        <div className="pt-10 flex flex-col justify-center items-center gap-20">
          <ConnectWallet/>
          <TotalSupply/>
          <StakeMoney/>
          <GetAirdrop/>
          <ShowUserBalance/>
          <ShowPoolBalance/>
        </div>
      </WagmiProvider>
    </QueryClientProvider>

  </div>
}






