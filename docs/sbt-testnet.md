# SBT Testnet Prototype

This package includes a testnet-only ERC-5192-style SBT prototype for experiments. The current ProofPass app remains wallet-free. Check-in, admin, and certificate pages do not require a wallet, and there is no production minting UI.

## Purpose

The prototype explores a non-transferable proof token that can point to an existing public certificate metadata URL. It is not a financial asset, not transferable event access, and not part of any payment flow.

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

## Successful Pilot Mint

The current pilot certificate mint was validated on Base Sepolia:

- Network: Base Sepolia
- Contract: `0x3d0C08e92C91C3e0B1cd0c11E876dAf7b8f3cDb4`
- Mint transaction: `0xea4f939cb23b062e78a46c7a0e1405ff28ecf7fa9d47abbd4e8cab89ec4bc1cc`
- Token ID: `2`
- Token URI: `https://proofpass-earn.vercel.app/cert/proof_xZ0Nb0iY9yMUf1/metadata`
- `locked(2)`: `true`

This validation remains testnet-only. The token is a non-transferable proof record, not a financial asset.

## Attach Mint Data To A Certificate

For pilot testing, SBT mint data is attached manually after a successful testnet mint. There is no production mint UI.

First run the optional nullable-field SQL if the pilot database does not already have the fields:

```sql
-- Run supabase/sbt-testnet-fields.sql
```

Then update the certificate by public slug:

```sql
update certificates
set
  chain_id = '84532',
  chain_name = 'Base Sepolia',
  contract_address = '0x3d0C08e92C91C3e0B1cd0c11E876dAf7b8f3cDb4',
  token_id = '2',
  tx_hash = '0xea4f939cb23b062e78a46c7a0e1405ff28ecf7fa9d47abbd4e8cab89ec4bc1cc',
  metadata_url = 'https://proofpass-earn.vercel.app/cert/proof_xZ0Nb0iY9yMUf1/metadata',
  token_uri = 'https://proofpass-earn.vercel.app/cert/proof_xZ0Nb0iY9yMUf1/metadata',
  minted_at = now(),
  sbt_status = 'locked'
where public_slug = 'proof_xZ0Nb0iY9yMUf1';
```

Do not attach participant email, private notes, or sensitive personal information to token metadata or on-chain records.

## Verify Locked Status

After minting, verify the token is locked by calling:

```solidity
locked(tokenId)
```

The expected result is `true` for minted tokens. Transfers and approvals are intentionally blocked.
