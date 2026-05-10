# SBT Testnet Prototype

This package includes a testnet-only ERC-5192-style SBT prototype for experiments. The current ProofPass Earn app remains wallet-free. Check-in, admin, and certificate pages do not require a wallet, and there is no production minting UI.

## Purpose

The prototype explores a non-transferable proof token that can point to an existing public certificate metadata URL. It is not a financial asset, not a tradable reward, and not part of any payment flow.

## Privacy Principles

- Do not place participant email on-chain.
- Do not place sensitive personal information on-chain.
- Use a metadata URL such as `https://proofpass-earn.vercel.app/cert/<slug>/metadata`.
- Early tests should use test certificates and test wallets, not real participant data.

## Environment Variables

Use server/local environment variables only:

```bash
TESTNET_RPC_URL=
TESTNET_DEPLOYER_PRIVATE_KEY=
TESTNET_SBT_CONTRACT_ADDRESS=
TESTNET_SBT_MINT_TO=
TESTNET_SBT_TOKEN_URI=
```

Do not use `NEXT_PUBLIC` variables for private keys.

## Compile

```bash
npm run contracts:compile
```

## Deploy To A Testnet

Set `TESTNET_RPC_URL` and `TESTNET_DEPLOYER_PRIVATE_KEY`, then run:

```bash
npm run contracts:deploy:testnet
```

The deploy script prints the deployed contract address. Save it as `TESTNET_SBT_CONTRACT_ADDRESS` for manual minting.

## Mint Manually

Set:

```bash
TESTNET_RPC_URL=
TESTNET_DEPLOYER_PRIVATE_KEY=
TESTNET_SBT_CONTRACT_ADDRESS=
TESTNET_SBT_MINT_TO=
TESTNET_SBT_TOKEN_URI=https://proofpass-earn.vercel.app/cert/<slug>/metadata
```

Then run:

```bash
npm run contracts:mint:testnet
```

The mint script requires the token URI to point to the public certificate metadata endpoint.

## Verify Locked Status

After minting, verify the token is locked by calling:

```solidity
locked(tokenId)
```

The expected result is `true` for minted tokens. Transfers and approvals are intentionally blocked.
