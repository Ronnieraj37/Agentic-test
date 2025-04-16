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