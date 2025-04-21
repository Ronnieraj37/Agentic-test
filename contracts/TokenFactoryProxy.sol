// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

/**
 * @title TokenFactoryProxy
 * @dev This contract implements an ERC1967 proxy for the TokenFactory contract.
 * It allows for upgradeable implementation of the TokenFactory functionality.
 */
contract TokenFactoryProxy is ERC1967Proxy {
    /**
     * @dev Initializes the proxy with an implementation and initialization data.
     * @param _implementation Address of the initial implementation contract
     * @param _data Data to send as msg.data to the implementation to initialize the proxied contract.
     * It should include the signature and the parameters of the function to be called.
     */
    constructor(address _implementation, bytes memory _data) ERC1967Proxy(_implementation, _data) {}
}
