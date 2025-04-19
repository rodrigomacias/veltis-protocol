import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const CONTRACT_NAME = "Veltis IPNFT";
const CONTRACT_SYMBOL = "VIPNFT";

const DeployVeltisIPNFTModule = buildModule("VeltisIPNFTModule", (m) => {
  // Deploy the simplified VeltisIPNFT contract with name and symbol arguments
  const veltisIPNFT = m.contract("VeltisIPNFT", [CONTRACT_NAME, CONTRACT_SYMBOL]);

  console.log(`Deploying VeltisIPNFT with Name: "${CONTRACT_NAME}", Symbol: "${CONTRACT_SYMBOL}"`);

  // Return the deployed contract instance for potential use in other modules
  return { veltisIPNFT };
});

export default DeployVeltisIPNFTModule;
