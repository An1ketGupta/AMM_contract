// Contract addresses - Update these with your deployed contract addresses
export const CONTRACT_ADDRESSES = {
  AMM: import.meta.env.VITE_AMM_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000",
  ETH_TOKEN: import.meta.env.VITE_ETH_TOKEN_ADDRESS || "0x0000000000000000000000000000000000000000",
  USDC_TOKEN: import.meta.env.VITE_USDC_TOKEN_ADDRESS || "0x0000000000000000000000000000000000000000",
};

// AMM Contract ABI
export const AMM_ABI = [
  "function ethToken() view returns (address)",
  "function usdcToken() view returns (address)",
  "function calculateShare(uint256 eth_amount, uint256 usdc_amount) view returns (uint256)",
  "function stake(uint256 amount_Eth, uint256 amount_USDC, uint256 minshares)",
  "function swapEthtoUsdc(uint256 ethAmount, uint256 minUSDC)",
  "function swapUsdcToEth(uint256 usdcAmount, uint256 minEth)",
  "function removeLiquidity(uint256 shares)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
];

// ERC20 Token ABI
export const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
];

// ETH Token ABI (includes airdrop function)
export const ETH_TOKEN_ABI = [
  ...ERC20_ABI,
  "function _requestAirdrop(uint256 _amount)",
];

