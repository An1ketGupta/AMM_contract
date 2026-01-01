# AMM Liquidity Pool Frontend

A clean, modern frontend UI structure for the AMM (Automated Market Maker) liquidity pool built with React, TypeScript, Vite, and Tailwind CSS.

## Features

- 🎨 **Modern UI**: Beautiful, responsive design with Tailwind CSS
- 📱 **Responsive Layout**: Works on desktop and mobile devices
- 🧩 **Component Structure**: Well-organized components ready for functionality implementation
- 🔌 **Wallet Button**: UI for wallet connection (functionality to be implemented)

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Build for Production**
   ```bash
   npm run build
   ```

## Project Structure

```
src/
├── components/          # React UI components
│   ├── WalletButton.tsx      # Wallet connection button UI
│   ├── PoolStats.tsx         # Pool statistics display UI
│   ├── BalanceDisplay.tsx    # User balance display UI
│   ├── Swap.tsx              # Token swap interface UI
│   ├── AddLiquidity.tsx       # Add liquidity interface UI
│   ├── RemoveLiquidity.tsx   # Remove liquidity interface UI
│   └── Airdrop.tsx           # Token airdrop interface UI
├── context/             # React context providers
│   └── Web3Context.tsx       # Basic Web3 context structure
├── config.ts            # Contract addresses and ABIs (reference)
├── App.tsx              # Main application component
└── main.tsx             # Application entry point
```

## Components Overview

All components have their UI structure in place with `TODO` comments where functionality needs to be implemented:

- **WalletButton**: Connect/disconnect wallet UI
- **Swap**: Token swap interface with direction toggle, input/output fields, and slippage settings
- **AddLiquidity**: Add liquidity interface with ETH and USDC inputs
- **RemoveLiquidity**: Remove liquidity interface with LP token input
- **PoolStats**: Display pool reserves (currently static)
- **BalanceDisplay**: Display user balances (currently static)
- **Airdrop**: Request test tokens interface

## Technologies

- **React 19**: UI library
- **TypeScript**: Type safety
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Styling
- **Ethers.js v6**: Installed but not used (ready for your implementation)

## Next Steps

1. Implement wallet connection in `Web3Context.tsx`
2. Add contract interaction logic in each component
3. Connect to your deployed contracts
4. Add state management for balances and pool data
5. Implement swap, liquidity, and other functionality

## Notes

- All functionality has been removed - only UI structure remains
- Components have `TODO` comments and console.logs where functionality should be added
- The config.ts file contains contract ABIs as reference
- The Web3Context provides a basic structure for wallet connection
