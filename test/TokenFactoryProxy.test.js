const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TokenFactory with Proxy", function () {
  let tokenFactory;
  let tokenFactoryImplementation;
  let tokenFactoryProxy;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy implementation
    const TokenFactory = await ethers.getContractFactory("TokenFactory");
    tokenFactoryImplementation = await TokenFactory.deploy();
    await tokenFactoryImplementation.waitForDeployment();

    // Prepare initialization data
    const tokenFactoryInterface = new ethers.Interface([
      "function initialize(address initialOwner)"
    ]);
    const initData = tokenFactoryInterface.encodeFunctionData("initialize", [owner.address]);

    // Deploy proxy
    const TokenFactoryProxy = await ethers.getContractFactory("TokenFactoryProxy");
    tokenFactoryProxy = await TokenFactoryProxy.deploy(tokenFactoryImplementation.target, initData);
    await tokenFactoryProxy.waitForDeployment();

    // Get factory with proxy
    tokenFactory = TokenFactory.attach(tokenFactoryProxy.target);
  });

  it("Should initialize with correct owner", async function () {
    expect(await tokenFactory.owner()).to.equal(owner.address);
  });

  it("Should allow creating tokens through the proxy", async function () {
    const name = "Test Token";
    const symbol = "TST";
    const initialSupply = 1000;

    const tx = await tokenFactory.createToken(name, symbol, initialSupply);
    const receipt = await tx.wait();

    // Extract token address from event
    const event = receipt.logs.find(
      (log) => log.fragment && log.fragment.name === "TokenDeployed"
    );
    const tokenAddress = event.args[0];

    // Get deployed tokens
    const deployedTokens = await tokenFactory.getDeployedTokens();
    expect(deployedTokens.length).to.equal(1);
    expect(deployedTokens[0]).to.equal(tokenAddress);

    // Get user tokens
    const userTokens = await tokenFactory.getUserTokens(owner.address);
    expect(userTokens.length).to.equal(1);
    expect(userTokens[0]).to.equal(tokenAddress);

    // Check token details
    const SimpleToken = await ethers.getContractFactory("SimpleToken");
    const token = SimpleToken.attach(tokenAddress);
    expect(await token.name()).to.equal(name);
    expect(await token.symbol()).to.equal(symbol);
    expect(await token.totalSupply()).to.equal(initialSupply);
    expect(await token.balanceOf(owner.address)).to.equal(initialSupply);
  });

  it("Should allow ownership transfer", async function () {
    await tokenFactory.transferOwnership(addr1.address);
    expect(await tokenFactory.owner()).to.equal(addr1.address);
  });

  it("Should only allow owner to transfer ownership", async function () {
    await expect(
      tokenFactory.connect(addr1).transferOwnership(addr2.address)
    ).to.be.revertedWith("TokenFactory: caller is not the owner");
  });
});
