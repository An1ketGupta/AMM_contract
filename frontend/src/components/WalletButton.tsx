import { useWeb3 } from '../context/Web3Context';

export const WalletButton = () => {
  const { account, connectWallet, disconnectWallet, isConnected } = useWeb3();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <button
      onClick={isConnected ? disconnectWallet : connectWallet}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
        isConnected
          ? 'bg-gray-700 text-white hover:bg-gray-600'
          : 'bg-blue-600 text-white hover:bg-blue-700'
      }`}
    >
      {isConnected ? (
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          {formatAddress(account!)}
        </span>
      ) : (
        'Connect Wallet'
      )}
    </button>
  );
};
