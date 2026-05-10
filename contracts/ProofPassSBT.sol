// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

interface IERC5192 {
    event Locked(uint256 tokenId);
    event Unlocked(uint256 tokenId);

    function locked(uint256 tokenId) external view returns (bool);
}

/// @notice Testnet-only prototype for non-transferable ProofPass proof tokens.
contract ProofPassSBT is ERC721, Ownable, IERC5192 {
    error SoulboundToken();

    uint256 private _nextTokenId = 1;
    mapping(uint256 => string) private _tokenUris;

    constructor(address initialOwner) ERC721("ProofPass Earn SBT", "PPEARN") Ownable(initialOwner) {}

    function mint(address to, string calldata uri) external onlyOwner returns (uint256 tokenId) {
        tokenId = _nextTokenId;
        _nextTokenId += 1;

        _safeMint(to, tokenId);
        _tokenUris[tokenId] = uri;

        emit Locked(tokenId);
    }

    function locked(uint256 tokenId) external view returns (bool) {
        ownerOf(tokenId);
        return true;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        ownerOf(tokenId);
        return _tokenUris[tokenId];
    }

    function approve(address, uint256) public pure override {
        revert SoulboundToken();
    }

    function setApprovalForAll(address, bool) public pure override {
        revert SoulboundToken();
    }

    function supportsInterface(bytes4 interfaceId) public view override returns (bool) {
        return interfaceId == type(IERC5192).interfaceId || super.supportsInterface(interfaceId);
    }

    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);

        if (from != address(0) && to != address(0)) {
            revert SoulboundToken();
        }

        return super._update(to, tokenId, auth);
    }
}
