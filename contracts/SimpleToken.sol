// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SimpleToken
 * @dev A simple ERC20 token with mint and burn capabilities
 */
contract SimpleToken is ERC20, Ownable, Pausable {
    /**
     * @dev Constructor that initializes the token with name and symbol
     */
    constructor() ERC20("SimpleToken", "STK") Ownable(msg.sender) {}

    /**
     * @dev Mints new tokens
     * @param to The address that will receive the minted tokens
     * @param amount The amount of tokens to mint
     */
    function mint(address to, uint256 amount) public onlyOwner whenNotPaused {
        _mint(to, amount);
    }

    /**
     * @dev Burns tokens from a specific address
     * @param from The address from which to burn tokens
     * @param amount The amount of tokens to burn
     */
    function burnFrom(address from, uint256 amount) public onlyOwner {
        _burn(from, amount);
    }

    /**
     * @dev Burns tokens from the caller's address
     * @param amount The amount of tokens to burn
     */
    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }

    /**
         * @dev Pause token transfers and operations
         * Only callable by owner
         */
        function pause() public onlyOwner {
            _pause();
        }
    
        /**
         * @dev Unpause token transfers and operations
         * Only callable by owner
         */
        function unpause() public onlyOwner {
            _unpause();
        }
}