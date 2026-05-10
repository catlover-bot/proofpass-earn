require("@nomicfoundation/hardhat-ethers");

const testnetRpcUrl = process.env.TESTNET_RPC_URL;
const deployerPrivateKey = process.env.TESTNET_DEPLOYER_PRIVATE_KEY;

/** @type {import("hardhat/config").HardhatUserConfig} */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      evmVersion: "cancun",
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    testnet: {
      url: testnetRpcUrl ?? "http://127.0.0.1:8545",
      accounts: deployerPrivateKey ? [deployerPrivateKey] : []
    }
  }
};
