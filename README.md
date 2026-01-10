# AniSwap — AMM Liquidity Pool

> A simple Automated Market Maker (AMM) project with a Solidity core (Foundry) and a React + Vite frontend. Includes an airdrop demo, token contracts, liquidity provision, swap, and withdrawal features.

## Repository Structure

- `contract/` — Foundry-based Solidity contracts, scripts, and broadcasts.
  - `src/` — Solidity contracts: `AMM.sol`, `NcyToken.sol`, `GULUToken.sol`.
  - `script/` — Deployment scripts (e.g. `DeploySepolia.s.sol`).
  - `broadcast/` — Recorded deployment runs.
- `frontend/` — React + Vite frontend.
  - `src/abis/` — Contract ABIs used by the frontend.
  - `src/components/` — UI components (airdrop, pool supply, staking, wallet connection, toast notifications).

## Features

- Swap tokens using a simple AMM contract.
- Provide and withdraw liquidity (pool management).
- Local ERC20 tokens for testing (`NcyToken`, `GULUToken`).
- Airdrop demo component to request test tokens from the UI.
- Wallet connect via Wagmi and React.

## Prerequisites

- Node.js (v16+ recommended)
- npm or pnpm/yarn
- Foundry (for contracts): https://getfoundry.sh/
- Anvil (comes with Foundry) for local RPC

## Quick Setup — Contracts (Foundry)

1. Install Foundry (if needed):

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

2. Run a local Anvil node:

```bash
anvil
```

3. From the `contract/` folder, run tests and build:

```bash
cd contract
forge test
forge build
```

4. To deploy (example using broadcast scripts):

```bash
forge script script/DeploySepolia.s.sol --rpc-url <RPC_URL> --broadcast
```

Replace `<RPC_URL>` with your provider (e.g. Alchemy/Infura Sepolia URL) and configure private keys via env vars.

## Quick Setup — Frontend

1. Install dependencies and run the dev server:

```bash
cd frontend
npm install
npm run dev
```

2. The UI runs on Vite; open the printed local URL (usually `http://localhost:5173`).

3. Configure contract addresses and ABIs in `frontend/src/configs/` if deploying to a testnet (Sepolia by default in this project).

## Notable Files

- `contract/src/AMM.sol` — core AMM logic.
- `contract/src/NcyToken.sol` and `contract/src/GULUToken.sol` — test tokens.
- `frontend/src/components/getAirdrop.tsx` — airdrop UI component.
- `frontend/src/components/Toast.tsx` — toast/notification provider.
- `frontend/src/App.tsx` — main app layout and navigation.

## Development Tips

- When running the frontend against local contracts, point the frontend's contract configs to the local Anvil RPC and deployed addresses.
- Use `forge test -vv` for verbose test output when debugging Solidity tests.
- Use the browser console and React DevTools to debug frontend state and wallet integration.

## Testing

- Contracts:

```bash
cd contract
forge test
```

- Frontend: use the Vite dev server for manual testing; unit tests (if added) would run with your chosen test runner.

## Deployment

- Contracts: use `forge script` with `--broadcast` and an RPC provider to deploy to testnets (e.g., Sepolia).
- Frontend: build with Vite and deploy the `dist` directory to any static host (Netlify, Vercel, GitHub Pages).

```bash
cd frontend
npm run build
# then publish the generated dist/
```

## Contributing

Contributions are welcome. Open an issue or submit a PR with a clear description of changes and tests where appropriate.

## License

This project does not include an explicit license file. Add an appropriate license (e.g., MIT) if you intend to open source it.

---

If you'd like, I can:

- Add a `LICENSE` file (MIT) and update the README with license details.
- Add a `Makefile` or `package.json` scripts to simplify common commands.
- Update the README with exact commands tailored to your environment (e.g., `pnpm` usage or CI steps).

Feel free to tell me which of the above you want next.
