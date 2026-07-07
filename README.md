# Nexiora ($NXIO)

**Fixed-supply, immutable ERC-20 token, live on Base mainnet.**

[![Chain: Base](https://img.shields.io/badge/chain-Base%20mainnet-0052FF)](https://basescan.org/token/0x90103aFee7f15f96A2DCBa2b7FF5459BfbfC4CaD)
[![Solidity 0.8.28](https://img.shields.io/badge/solidity-0.8.28-363636)](contracts/Nexiora.sol)
[![OpenZeppelin 5.x](https://img.shields.io/badge/OpenZeppelin-5.x-4E5EE4)](https://github.com/OpenZeppelin/openzeppelin-contracts)
[![License: MIT](https://img.shields.io/badge/license-MIT-green)](LICENSE)

---

## ⚠️ Official contract address

Nexiora exists **only on Base mainnet**, at this address:

```
0x90103aFee7f15f96A2DCBa2b7FF5459BfbfC4CaD
```

Any token named "Nexiora" or "NXIO" at any other address, or on any other network, is **not** this project. Always verify the address before interacting.

## Token details

| | |
|---|---|
| **Name** | Nexiora |
| **Symbol** | NXIO |
| **Network** | Base mainnet (chain ID 8453) |
| **Contract** | [`0x90103aFee7f15f96A2DCBa2b7FF5459BfbfC4CaD`](https://basescan.org/token/0x90103aFee7f15f96A2DCBa2b7FF5459BfbfC4CaD) |
| **Total supply** | 10,000,000,000 NXIO (fixed forever) |
| **Decimals** | 18 |
| **Standard** | ERC-20 ([OpenZeppelin 5.x](https://github.com/OpenZeppelin/openzeppelin-contracts)) |

## Design: what this contract can never do

The entire contract is [15 lines](contracts/Nexiora.sol) on top of OpenZeppelin's audited ERC-20. The full supply is minted once in the constructor, and there is **no owner and no admin functions**. That means, permanently and verifiably:

- ❌ No minting — the supply can never increase
- ❌ No pausing — transfers can never be frozen
- ❌ No blacklist — no address can ever be blocked
- ❌ No fees or taxes on transfers
- ❌ No upgrades — the code on-chain is final

What you see in [`contracts/Nexiora.sol`](contracts/Nexiora.sol) is the complete, immutable behavior of the token.

## Verification

The deployed bytecode is verified as an **exact match** of this repository's source:

- **Basescan:** [contract page](https://basescan.org/address/0x90103aFee7f15f96A2DCBa2b7FF5459BfbfC4CaD)
- **Blockscout:** [verified source](https://base.blockscout.com/address/0x90103aFee7f15f96A2DCBa2b7FF5459BfbfC4CaD)
- **Sourcify:** [lookup 0x9010...4CaD](https://sourcify.dev/#/lookup/0x90103aFee7f15f96A2DCBa2b7FF5459BfbfC4CaD)

You can reproduce the verification yourself: `artifacts/verify-input.json` is the exact solc standard-JSON input (compiler `0.8.28+commit.7893614a`, optimizer on, 200 runs) that produces the deployed bytecode.

## Add NXIO to your wallet

1. Switch your wallet to the **Base** network.
2. Import a custom token with the contract address above.
3. Symbol `NXIO` and 18 decimals are detected automatically.

## Repository layout

```
contracts/Nexiora.sol      The token contract (everything else supports it)
scripts/compile.js         Compile with solc, emit ABI/bytecode/verification input
scripts/generate-wallet.js Create a fresh throwaway deployer wallet
scripts/deploy.js          Deploy to a network: node scripts/deploy.js <network> <recipient> <supply>
scripts/verify-sourcify.js Verify the deployed contract on Sourcify
scripts/sweep.js           Return leftover gas ETH from the deployer
artifacts/                 Compiled output + standard-JSON verification input
deployment.base.json       Base mainnet deployment record
deployment.sepolia.json    Sepolia testnet rehearsal record
```

## Build and deploy it yourself

```bash
npm install
npm run compile                  # compile the contract
node scripts/generate-wallet.js  # create a throwaway deployer (.deployer.json, gitignored)
# fund the deployer with a little gas ETH on your target network, then:
node scripts/deploy.js base <recipientAddress> <supplyInWholeTokens>
node scripts/verify-sourcify.js base
node scripts/sweep.js base <yourAddress>   # recover leftover gas
```

Supported networks: `base` (mainnet), `sepolia` (testnet). The deploy pattern uses a disposable wallet that only ever holds gas money — the minted supply goes straight to the recipient address, and personal keys are never touched.

## Deployment history

| Date | Network | Contract | Status |
|---|---|---|---|
| 2026-07-07 | Base mainnet | [`0x9010...4CaD`](https://basescan.org/address/0x90103aFee7f15f96A2DCBa2b7FF5459BfbfC4CaD) | ✅ Live — canonical |
| 2026-07-06 | Sepolia testnet | [`0xa896...F445`](https://sepolia.etherscan.io/address/0xa896960FB23f526B0791b442C51fDa1a2ee5F445) | 🧪 Rehearsal only |

## Disclaimer

NXIO is a community token. Nothing in this repository is financial advice, and no statement here is a promise of value, profit, or future development. Interacting with smart contracts carries risk — do your own research.

## License

[MIT](LICENSE) — contract, scripts, and documentation.
