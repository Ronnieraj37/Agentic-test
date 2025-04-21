const hre = require("hardhat");

async function main() {
  // Deploy the SimpleToken contract
  const SimpleToken = await hre.ethers.getContractFactory("SimpleToken");
  const simpleToken = await SimpleToken.deploy();
  await simpleToken.waitForDeployment();

  const address = await simpleToken.getAddress();
  console.log(`SimpleToken deployed to: ${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  
  // Deploy the implementation contract
  const TokenFactoryImplementation = await hre.ethers.deployContract("TokenFactory");
  await TokenFactoryImplementation.waitForDeployment();
  console.log(`TokenFactory implementation deployed to ${TokenFactoryImplementation.target}`);
  
  // Prepare initialization data
  const tokenFactoryInterface = new hre.ethers.Interface([
    "function initialize(address initialOwner)"
  ]);
  const initData = tokenFactoryInterface.encodeFunctionData("initialize", [deployer.address]);
  
  // Deploy the proxy
  const TokenFactoryProxy = await hre.ethers.deployContract("TokenFactoryProxy", [
    TokenFactoryImplementation.target,
    initData
  ]);
  await TokenFactoryProxy.waitForDeployment();
  console.log(`TokenFactory proxy deployed to ${TokenFactoryProxy.target}`);
}