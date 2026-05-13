# Web3 Roadmap

ProofPass is off-chain first. Web3 support should remain optional, non-speculative, and privacy-first.

## Phase 1: Off-Chain Proof Pages

- Public certificate pages for attendance, speaking, contribution, and organizer proof.
- No wallet required.
- No minting.
- No payment flow.

## Phase 2: Proof Metadata Endpoint

- Public JSON metadata for certificate pages.
- Metadata should support future proof integrations.
- Participant email must not appear in public metadata.
- Sensitive personal data should be avoided.

## Phase 3: Open Badges / Verifiable Credentials

- Explore portable proof formats that can work without chain dependency.
- Keep participant privacy controls explicit.
- Keep organizer ownership and revocation requirements clear.

## Phase 4: Testnet ERC-5192 SBT Prototype

- Prototype non-transferable SBT issuance on testnet only.
- Use metadata that avoids personal information.
- Do not add tradable token logic.
- Do not add exchange or speculative mechanics.

## Phase 5: Optional Production SBT Issuance

- Allow selected events to opt in.
- Keep issuance non-transferable.
- Keep personal information off-chain.
- Require clear organizer and participant consent.

## Privacy Principles

- No participant email in public metadata.
- No raw participant email hash in public metadata.
- No personal information on-chain.
- No tradable token logic.
- No financial asset positioning.
