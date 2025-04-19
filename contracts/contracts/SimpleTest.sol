pragma solidity ^0.8.18;

contract SimpleTest {
    uint256 private value;
    
    function setValue(uint256 _value) public {
        value = _value;
    }
    
    function getValue() public view returns (uint256) {
        return value;
    }
}
