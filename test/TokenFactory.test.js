const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TokenFactory", function () {
  let TokenFactory;
  let tokenFactory;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  beforeEach(async function () {
    // Get the ContractFactory and Signers here
    TokenFactory = await ethers.getContractFactory("TokenFactory");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    // Deploy TokenFactory contract
    tokenFactory = await TokenFactory.deploy();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await tokenFactory.owner()).to.equal(owner.address);
    });

    it("Should initialize with zero tokens", async function () {
      expect(await tokenFactory.getTokenCount()).to.equal(0);
    });
  });

  describe("Token Creation", function () {
    it("Should create a new token", async function () {
      const tokenName = "Test Token";
      const tokenSymbol = "TTK";
      const initialSupply = ethers.parseEther("1000");

      await tokenFactory.createToken(tokenName, tokenSymbol, initialSupply);

      expect(await tokenFactory.getTokenCount()).to.equal(1);
      const tokenAddress = await tokenFactory.getToken(0);
      expect(tokenAddress).to.not.equal(ethers.ZeroAddress);

      // Check if the token was deployed correctly
      const SimpleToken = await ethers.getContractFactory("SimpleToken");
      const token = SimpleToken.attach(tokenAddress);
      
      expect(await token.name()).to.equal(tokenName);
      expect(await token.symbol()).to.equal(tokenSymbol);
      expect(await token.totalSupply()).to.equal(initialSupply);
      expect(await token.balanceOf(owner.address)).to.equal(initialSupply);
    });

    it("Should create multiple tokens", async function () {
      // Create first token
      await tokenFactory.createToken("Token 1", "TK1", ethers.parseEther("1000"));
      
      // Create second token
      await tokenFactory.createToken("Token 2", "TK2", ethers.parseEther("2000"));
      
      // Create third token
      await tokenFactory.createToken("Token 3", "TK3", ethers.parseEther("3000"));

      expect(await tokenFactory.getTokenCount()).to.equal(3);

      // Check all tokens are retrievable
      const token1Address = await tokenFactory.getToken(0);
      const token2Address = await tokenFactory.getToken(1);
      const token3Address = await tokenFactory.getToken(2);

      expect(token1Address).to.not.equal(ethers.ZeroAddress);
      expect(token2Address).to.not.equal(ethers.ZeroAddress);
      expect(token3Address).to.not.equal(ethers.ZeroAddress);
    });

    it("Should emit TokenCreated event", async function () {
      const tokenName = "Event Token";
      const tokenSymbol = "EVT";
      const initialSupply = ethers.parseEther("1000");

      await expect(tokenFactory.createToken(tokenName, tokenSymbol, initialSupply))
        .to.emit(tokenFactory, "TokenCreated")
        .withArgs(0, await tokenFactory.getAddress(), expect.any(String));
    });
  });

  describe("Token Retrieval", function () {
    beforeEach(async function () {
      // Create a few tokens before each test in this block
      await tokenFactory.createToken("Test Token 1", "TT1", ethers.parseEther("1000"));
      await tokenFactory.createToken("Test Token 2", "TT2", ethers.parseEther("2000"));
    });

    it("Should retrieve correct token addresses", async function () {
      const token1Address = await tokenFactory.getToken(0);
      const token2Address = await tokenFactory.getToken(1);

      // Attaching to the tokens to verify they exist
      const SimpleToken = await ethers.getContractFactory("SimpleToken");
      const token1 = SimpleToken.attach(token1Address);
      const token2 = SimpleToken.attach(token2Address);

      expect(await token1.name()).to.equal("Test Token 1");
      expect(await token2.name()).to.equal("Test Token 2");
    });

    it("Should retrieve all tokens", async function () {
      const allTokens = await tokenFactory.getAllTokens();
      expect(allTokens.length).to.equal(2);

      // Verify both addresses are non-zero
      allTokens.forEach(addr => {
        expect(addr).to.not.equal(ethers.ZeroAddress);
      });
    });

    it("Should fail when retrieving non-existent token", async function () {
      await expect(tokenFactory.getToken(5)).to.be.revertedWith("Token does not exist");
    });
  });

  describe("Ownership", function () {
    it("Should allow only owner to renounce ownership", async function () {
      // Non-owner tries to renounce ownership
      await expect(tokenFactory.connect(addr1).renounceOwnership())
        .to.be.revertedWith("Ownable: caller is not the owner");

      // Owner renounces ownership
      await tokenFactory.renounceOwnership();
      expect(await tokenFactory.owner()).to.equal(ethers.ZeroAddress);
    });

    it("Should allow only owner to transfer ownership", async function () {
      // Non-owner tries to transfer ownership
      await expect(tokenFactory.connect(addr1).transferOwnership(addr2.address))
        .to.be.revertedWith("Ownable: caller is not the owner");

      // Owner transfers ownership
      await tokenFactory.transferOwnership(addr1.address);
      expect(await tokenFactory.owner()).to.equal(addr1.address);
    });
  });

  describe("Edge cases", function () {
    it("Should handle tokens with zero initial supply", async function () {
      await tokenFactory.createToken("Zero Token", "ZT", 0);
      const tokenAddress = await tokenFactory.getToken(0);
      
      const SimpleToken = await ethers.getContractFactory("SimpleToken");
      const token = SimpleToken.attach(tokenAddress);
      
      expect(await token.totalSupply()).to.equal(0);
      expect(await token.balanceOf(owner.address)).to.equal(0);
    });

    it("Should handle tokens with maximum possible supply", async function () {
      // Use a very large number but within uint256 range
      const maxSupply = ethers.MaxUint256;
      
      await tokenFactory.createToken("Max Token", "MAX", maxSupply);
      const tokenAddress = await tokenFactory.getToken(0);
      
      const SimpleToken = await ethers.getContractFactory("SimpleToken");
      const token = SimpleToken.attach(tokenAddress);
      
      expect(await token.totalSupply()).to.equal(maxSupply);
      expect(await token.balanceOf(owner.address)).to.equal(maxSupply);
    });
  });
});
