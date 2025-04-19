import { expect } from "chai";
import { ethers } from "hardhat";
import { VeltisIPNFT } from "../typechain-types"; // Assuming typechain generated types

describe("VeltisIPNFT (Simplified)", function () {
  let veltisIPNFT: VeltisIPNFT;
  let deployer: any; // Using 'any' for simplicity, replace with SignerWithAddress if using hardhat-ethers
  let user1: any;
  let user2: any;

  const contract_name = "Veltis IPNFT";
  const contract_symbol = "VIPNFT";
  const test_uri_1 = "ipfs://metadata1";
  const test_uri_2 = "ipfs://metadata2";

  beforeEach(async function () {
    // Get signers
    [deployer, user1, user2] = await ethers.getSigners();

    // Deploy the contract
    const VeltisIPNFTFactory = await ethers.getContractFactory("VeltisIPNFT");
    veltisIPNFT = await VeltisIPNFTFactory.deploy(contract_name, contract_symbol);
    // Wait for deployment to finish - removed await veltisIPNFT.deployed() as it's deprecated
    await veltisIPNFT.waitForDeployment(); // Use waitForDeployment instead
  });

  describe("Deployment", function () {
    it("Should set the correct name and symbol", async function () {
      expect(await veltisIPNFT.name()).to.equal(contract_name);
      expect(await veltisIPNFT.symbol()).to.equal(contract_symbol);
    });
  });

  describe("Minting", function () {
    it("Should allow a user to mint an NFT", async function () {
      const mintTx = await veltisIPNFT.connect(user1).safeMint(user1.address, test_uri_1);
      const receipt = await mintTx.wait(); // Wait for transaction confirmation

      // Check for Transfer event (optional but good practice)
      // Note: Event checking might require enabling event emission in Hardhat config or specific listeners
      // For simplicity, we'll check ownership and token URI directly

      const tokenId = 0; // First token minted should have ID 0
      expect(await veltisIPNFT.ownerOf(tokenId)).to.equal(user1.address);
      expect(await veltisIPNFT.tokenURI(tokenId)).to.equal(test_uri_1);
    });

    it("Should mint sequential token IDs", async function () {
      await veltisIPNFT.connect(user1).safeMint(user1.address, test_uri_1);
      await veltisIPNFT.connect(user2).safeMint(user2.address, test_uri_2);

      expect(await veltisIPNFT.ownerOf(0)).to.equal(user1.address);
      expect(await veltisIPNFT.ownerOf(1)).to.equal(user2.address);
    });

    it("Should return the correct token ID on mint", async function () {
       // Using static call to get return value without sending a transaction
       const expectedTokenId = await veltisIPNFT.connect(user1).safeMint.staticCall(user1.address, test_uri_1);
       expect(expectedTokenId).to.equal(0);

       // Actually mint
       await veltisIPNFT.connect(user1).safeMint(user1.address, test_uri_1);

       const expectedTokenId2 = await veltisIPNFT.connect(user2).safeMint.staticCall(user2.address, test_uri_2);
       expect(expectedTokenId2).to.equal(1);
    });
  });

  describe("Token URI", function () {
    it("Should return the correct token URI for a minted token", async function () {
      await veltisIPNFT.connect(user1).safeMint(user1.address, test_uri_1);
      const tokenId = 0;
      expect(await veltisIPNFT.tokenURI(tokenId)).to.equal(test_uri_1);
    });

    it("Should revert when querying URI for a non-existent token", async function () {
      // Newer OZ versions use custom errors
      await expect(veltisIPNFT.tokenURI(999))
        .to.be.revertedWithCustomError(veltisIPNFT, "ERC721NonexistentToken")
        .withArgs(999);
    });
  });

   describe("Burning", function () {
    beforeEach(async function() {
        // Mint a token for user1 to burn
        await veltisIPNFT.connect(user1).safeMint(user1.address, test_uri_1);
    });

    it("Should allow the owner to burn their token", async function () {
      const tokenId = 0;
      expect(await veltisIPNFT.ownerOf(tokenId)).to.equal(user1.address);

      await expect(veltisIPNFT.connect(user1).burn(tokenId))
        .to.emit(veltisIPNFT, "Transfer") // Check for Transfer event to address(0)
        .withArgs(user1.address, ethers.ZeroAddress, tokenId);

      // Verify token is gone
      await expect(veltisIPNFT.ownerOf(tokenId))
        .to.be.revertedWithCustomError(veltisIPNFT, "ERC721NonexistentToken")
        .withArgs(tokenId);
    });

    it("Should prevent burning a token by a non-owner", async function () {
      const tokenId = 0;
      // Newer OZ versions use custom errors
      await expect(veltisIPNFT.connect(user2).burn(tokenId))
        .to.be.revertedWithCustomError(veltisIPNFT, "ERC721InsufficientApproval")
        .withArgs(user2.address, tokenId);
    });

     it("Should prevent burning a non-existent token", async function () {
       // Newer OZ versions use custom errors
      await expect(veltisIPNFT.connect(user1).burn(999))
        .to.be.revertedWithCustomError(veltisIPNFT, "ERC721NonexistentToken")
        .withArgs(999);
    });
  });

  describe("Supports Interface", function () {
    it("Should support ERC721 interface", async function () {
      expect(await veltisIPNFT.supportsInterface("0x80ac58cd")).to.be.true; // ERC721 interface ID
    });

    it("Should support ERC721Metadata interface", async function () {
      expect(await veltisIPNFT.supportsInterface("0x5b5e139f")).to.be.true; // ERC721Metadata interface ID
    });

     it("Should support ERC721URIStorage interface", async function () {
      // ERC721URIStorage does not have a standard interface ID separate from Metadata
      // We check by ensuring tokenURI works as expected (covered in other tests)
      // and supportsInterface for ERC721Metadata is true.
       expect(await veltisIPNFT.supportsInterface("0x5b5e139f")).to.be.true;
    });

    it("Should support ERC721Burnable interface", async function () {
       // ERC721Burnable does not have a standard separate interface ID
       // We check by ensuring burn works as expected (covered in other tests)
       // and supportsInterface for ERC721 is true.
       expect(await veltisIPNFT.supportsInterface("0x80ac58cd")).to.be.true;
    });

     it("Should not support random interface", async function () {
      expect(await veltisIPNFT.supportsInterface("0xffffffff")).to.be.false;
    });
  });

});
