import "@nomicfoundation/hardhat-ethers";
import hre from "hardhat";

const METADATA_URL_PREFIX = "https://proofpass-earn.vercel.app/cert/";
const METADATA_URL_SUFFIX = "/metadata";

function requireEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required.`);
  }

  return value;
}

async function main() {
  requireEnv("TESTNET_RPC_URL");
  requireEnv("TESTNET_DEPLOYER_PRIVATE_KEY");

  const contractAddress = requireEnv("TESTNET_SBT_CONTRACT_ADDRESS");
  const mintTo = requireEnv("TESTNET_SBT_MINT_TO");
  const tokenUri = requireEnv("TESTNET_SBT_TOKEN_URI");

  if (!tokenUri.startsWith(METADATA_URL_PREFIX) || !tokenUri.endsWith(METADATA_URL_SUFFIX)) {
    throw new Error("TESTNET_SBT_TOKEN_URI must point to https://proofpass-earn.vercel.app/cert/<slug>/metadata.");
  }

  const { ethers } = hre;
  const ProofPassSBT = await ethers.getContractFactory("ProofPassSBT");
  const contract = ProofPassSBT.attach(contractAddress);
  const tx = await contract.mint(mintTo, tokenUri);
  const receipt = await tx.wait();

  console.log("Mint transaction:", receipt?.hash ?? tx.hash);
  console.log("Recipient:", mintTo);
  console.log("Metadata URL:", tokenUri);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
