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

const main = async () => {
  // Deploy TokenFactory implementation
  const TokenFactory = await ethers.getContractFactory("TokenFactory");
  const tokenFactoryImpl = await TokenFactory.deploy();
  await tokenFactoryImpl.waitForDeployment();
  console.log(`TokenFactory implementation deployed to ${tokenFactoryImpl.target}`);
  
  // Get initialization data
  const [deployer] = await ethers.getSigners();
  const initData = TokenFactory.interface.encodeFunctionData("initialize", [deployer.address]);
  
  // Deploy proxy
  const TokenFactoryProxy = await ethers.getContractFactory("TokenFactoryProxy");
  const proxy = await TokenFactoryProxy.deploy(tokenFactoryImpl.target, initData);
  await proxy.waitForDeployment();
  console.log(`TokenFactoryProxy deployed to ${proxy.target}`);
  
  // Get the factory instance pointing to the proxy
  const factory = TokenFactory.attach(proxy.target);
  console.log(`TokenFactory (via proxy) ready at ${factory.target}`);
};