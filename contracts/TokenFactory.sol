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


// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./SimpleToken.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol";

contract TokenFactory is Initializable, UUPSUpgradeable {
    address[] public deployedTokens;
    mapping(address => address[]) public userTokens;
    address private _owner;
    
    event TokenDeployed(address tokenAddress, address owner, string name, string symbol);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    
    modifier onlyOwner() {
        require(_owner == msg.sender, "TokenFactory: caller is not the owner");
        _;
    }
    
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }
    
    function initialize(address initialOwner) public initializer {
        _owner = initialOwner;
        emit OwnershipTransferred(address(0), initialOwner);
    }
    
    function createToken(string memory name, string memory symbol, uint256 initialSupply) public returns (address) {
        SimpleToken newToken = new SimpleToken(name, symbol, initialSupply, msg.sender);
        address tokenAddress = address(newToken);
        
        deployedTokens.push(tokenAddress);
        userTokens[msg.sender].push(tokenAddress);
        
        emit TokenDeployed(tokenAddress, msg.sender, name, symbol);
        
        return tokenAddress;
    }
    
    function getDeployedTokens() public view returns (address[] memory) {
        return deployedTokens;
    }
    
    function getUserTokens(address user) public view returns (address[] memory) {
        return userTokens[user];
    }
    
    function owner() public view returns (address) {
        return _owner;
    }
    
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "TokenFactory: new owner is the zero address");
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
    
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}