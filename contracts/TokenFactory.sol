// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/ERC1967/ERC1967Proxy.sol";
import "./SimpleToken.sol";

contract TokenFactory is Ownable {
    // The SimpleToken implementation contract
    address public tokenImplementation;
    
    // Mapping to track all deployed tokens
    mapping(address => bool) public deployedTokens;
    address[] public tokensList;
    
    // Events
    event TokenDeployed(address indexed tokenAddress, string name, string symbol, uint256 initialSupply, address owner);
    event ImplementationUpdated(address indexed newImplementation);
    
    constructor() Ownable(msg.sender) {
        // Deploy the implementation contract
        tokenImplementation = address(new SimpleToken());
    }
    
    /**
     * @dev Deploy a new token with proxy pattern
     * @param name The name of the token
     * @param symbol The symbol of the token
     * @param initialSupply The initial supply of the token
     * @param tokenOwner The owner of the token
     * @return tokenAddress The address of the deployed token
     */
    function deployToken(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        address tokenOwner
    ) external returns (address tokenAddress) {
        // Prepare initialization data
        bytes memory initData = abi.encodeWithSelector(
            SimpleToken.initialize.selector,
            name,
            symbol,
            initialSupply,
            tokenOwner
        );
        
        // Deploy proxy
        ERC1967Proxy proxy = new ERC1967Proxy(
            tokenImplementation,
            initData
        );
        
        tokenAddress = address(proxy);
        
        // Track the deployed token
        deployedTokens[tokenAddress] = true;
        tokensList.push(tokenAddress);
        
        emit TokenDeployed(tokenAddress, name, symbol, initialSupply, tokenOwner);
        
        return tokenAddress;
    }
    
    /**
     * @dev Update the token implementation
     * @param newImplementation The address of the new implementation
     */
    function updateImplementation(address newImplementation) external onlyOwner {
        require(newImplementation != address(0), "Invalid implementation address");
        tokenImplementation = newImplementation;
        emit ImplementationUpdated(newImplementation);
    }
    
    /**
     * @dev Get the number of deployed tokens
     * @return count The number of deployed tokens
     */
    function getTokenCount() external view returns (uint256) {
        return tokensList.length;
    }
    
    /**
     * @dev Check if a token was deployed by this factory
     * @param tokenAddress The address to check
     * @return isDeployed True if the token was deployed by this factory
     */
    function isTokenDeployed(address tokenAddress) external view returns (bool) {
        return deployedTokens[tokenAddress];
    }
}
