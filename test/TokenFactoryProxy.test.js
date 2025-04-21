const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TokenFactoryProxy", function () {
  let TokenFactory;
  let tokenFactoryImpl;
  let tokenFactoryProxy;
  let factoryInstance;
  let owner;
  let otherAccount;
  let initData;

  beforeEach(async function () {
    [owner, otherAccount] = await ethers.getSigners();
    
    // Deploy implementation
    TokenFactory = await ethers.getContractFactory("TokenFactory");
    tokenFactoryImpl = await TokenFactory.deploy();
    await tokenFactoryImpl.waitForDeployment();
    
    // Prepare initialization data
    initData = TokenFactory.interface.encodeFunctionData("initialize", [owner.address]);
    
    // Deploy proxy
    const TokenFactoryProxy = await ethers.getContractFactory("TokenFactoryProxy");
    tokenFactoryProxy = await TokenFactoryProxy.deploy(tokenFactoryImpl.target, initData);
    await tokenFactoryProxy.waitForDeployment();
    
    // Get factory instance pointing to the proxy
    factoryInstance = TokenFactory.attach(tokenFactoryProxy.target);
  });

  it("should initialize with the correct owner", async function () {
    expect(await factoryInstance.owner()).to.equal(owner.address);
  });

  it("should create tokens through the proxy", async function () {
    const tokenName = "Test Token";
    const tokenSymbol = "TST";
    const initialSupply = ethers.parseEther("1000");
    
    await factoryInstance.createToken(tokenName, tokenSymbol, initialSupply);
    
    const tokenAddress = await factoryInstance.getToken(0);
    expect(tokenAddress).to.not.equal(ethers.ZeroAddress);
    
    const SimpleToken = await ethers.getContractFactory("SimpleToken");
    const tokenInstance = SimpleToken.attach(tokenAddress);
    
    expect(await tokenInstance.name()).to.equal(tokenName);
    expect(await tokenInstance.symbol()).to.equal(tokenSymbol);
    expect(await tokenInstance.totalSupply()).to.equal(initialSupply);
  });

  it("should allow upgrades by the owner", async function () {
    // Deploy a new implementation
    const TokenFactoryV2 = await ethers.getContractFactory("TokenFactory");
    const newImplementation = await TokenFactoryV2.deploy();
    await newImplementation.waitForDeployment();
    
    // Upgrade to the new implementation
    await factoryInstance.upgradeToAndCall(newImplementation.target, "0x");
    
    // Verify the implementation was upgraded
    const SimpleToken = await ethers.getContractFactory("SimpleToken");
    const initialSupply = ethers.parseEther("500");
    
    await factoryInstance.createToken("New Token", "NEW", initialSupply);
    const newTokenAddress = await factoryInstance.getToken(0);
    
    const newToken = SimpleToken.attach(newTokenAddress);
    expect(await newToken.totalSupply()).to.equal(initialSupply);
  });

  it("should prevent non-owners from upgrading", async function () {
    // Deploy a new implementation
    const TokenFactoryV2 = await ethers.getContractFactory("TokenFactory");
    const newImplementation = await TokenFactoryV2.deploy();
    await newImplementation.waitForDeployment();
    
    // Try to upgrade from non-owner account
    await expect(
      factoryInstance.connect(otherAccount).upgradeToAndCall(newImplementation.target, "0x")
    ).to.be.revertedWithCustomError(factoryInstance, "OwnableUnauthorizedAccount");
  });
});
