const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SimpleToken", function () {
  let SimpleToken, simpleToken, owner, addr1, addr2;

  beforeEach(async function () {
    // Get contract factories and signers
    SimpleToken = await ethers.getContractFactory("SimpleToken");
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy the contract
    simpleToken = await SimpleToken.deploy();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await simpleToken.owner()).to.equal(owner.address);
    });

    it("Should have correct name and symbol", async function () {
      expect(await simpleToken.name()).to.equal("SimpleToken");
      expect(await simpleToken.symbol()).to.equal("STK");
    });

    it("Should have 0 initial supply", async function () {
      expect(await simpleToken.totalSupply()).to.equal(0);
    });
  });

  describe("Minting", function () {
    it("Should allow owner to mint tokens", async function () {
      await simpleToken.mint(addr1.address, 100);
      expect(await simpleToken.balanceOf(addr1.address)).to.equal(100);
      expect(await simpleToken.totalSupply()).to.equal(100);
    });

    it("Should fail if non-owner tries to mint tokens", async function () {
      await expect(
        simpleToken.connect(addr1).mint(addr1.address, 100)
      ).to.be.revertedWithCustomError(simpleToken, "OwnableUnauthorizedAccount");
    });
  });

  describe("Burning", function () {
    beforeEach(async function () {
      // Mint some tokens to addr1 for burning tests
      await simpleToken.mint(addr1.address, 1000);
    });

    it("Should allow users to burn their tokens", async function () {
      await simpleToken.connect(addr1).burn(100);
      expect(await simpleToken.balanceOf(addr1.address)).to.equal(900);
      expect(await simpleToken.totalSupply()).to.equal(900);
    });

    it("Should allow owner to burn tokens from any address", async function () {
      await simpleToken.burnFrom(addr1.address, 200);
      expect(await simpleToken.balanceOf(addr1.address)).to.equal(800);
      expect(await simpleToken.totalSupply()).to.equal(800);
    });

    it("Should fail if non-owner tries to burn tokens from another address", async function () {
      await expect(
        simpleToken.connect(addr2).burnFrom(addr1.address, 200)
      ).to.be.revertedWithCustomError(simpleToken, "OwnableUnauthorizedAccount");
    });
  });
});