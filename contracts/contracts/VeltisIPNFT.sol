// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Import non-upgradeable versions to simplify dependencies
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol"; // Import Burnable
// Removed Ownable and UUPS imports

/**
 * @title VeltisIPNFT (Simplified)
 * @dev Basic ERC721 Non-Fungible Token contract for Veltis Protocol IP Records.
 * Non-upgradeable version to simplify dependencies.
 * Allows users to mint tokens representing their intellectual property records.
 * Metadata URI points to IPFS JSON containing file hash and original file CID.
 */
contract VeltisIPNFT is ERC721, ERC721URIStorage, ERC721Burnable { // Inherit Burnable
    // Simple counter for token IDs, replacing CountersUpgradeable
    uint256 private _nextTokenId;

    // Removed Initializable and UUPS related code

    /**
     * @dev Initializes the contract, setting the name and symbol.
     * The deployer address becomes the initial owner implicitly if needed later.
     */
    constructor(string memory name, string memory symbol) ERC721(name, symbol) {
        // Constructor logic for non-upgradeable contract
    }

    /**
     * @dev Mints a new IPNFT to the specified address.
     * The URI should point to a metadata JSON file on IPFS.
     * Can be called by any address (intended to be called by the user via frontend).
     * @param to The address to mint the token to.
     * @param uri The IPFS URI of the metadata JSON file.
     * @return The ID of the newly minted token.
     */
    function safeMint(address to, string memory uri) public returns (uint256) {
        // #Reason: Using a simple internal counter for unique token IDs.
        uint256 tokenId = _nextTokenId++; // Increment after assigning

        // #Reason: _safeMint handles ERC721 minting logic, including safety checks.
        _safeMint(to, tokenId);

        // #Reason: _setTokenURI links the token ID to its metadata on IPFS.
        _setTokenURI(tokenId, uri);

        return tokenId;
    }

    /**
     * @dev See {IERC721Metadata-tokenURI}.
     * Overrides the function to use the URI storage extension.
     */
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage) // Override non-upgradeable versions
        returns (string memory)
    {
        // _exists check is implicitly handled by ERC721URIStorage's tokenURI
        return super.tokenURI(tokenId);
    }

    // Removed _authorizeUpgrade function

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage) // Override non-upgradeable versions
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @dev Burns `tokenId`. See {ERC721-_burn}.
     *
     * Requirements:
     *
     * - The caller must own `tokenId` or be an approved operator.
     *
     * Added burn function as it's often useful.
     */
    // The burn function inherited from ERC721Burnable already includes the necessary checks.
    // We don't need to override it unless adding custom logic.
    // function burn(uint256 tokenId) public virtual override {
    //     super.burn(tokenId);
    // }
    // Removing the explicit override as the inherited function is sufficient.
}
