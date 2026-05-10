import "@nomicfoundation/hardhat-ethers";
import hre from "hardhat";

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

  const { ethers } = hre;
  const [deployer] = await ethers.getSigners();
  const ProofPassSBT = await ethers.getContractFactory("ProofPassSBT");
  const contract = await ProofPassSBT.deploy(deployer.address);

  await contract.waitForDeployment();

  console.log("ProofPassSBT deployed to:", await contract.getAddress());
  console.log("Owner:", deployer.address);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
