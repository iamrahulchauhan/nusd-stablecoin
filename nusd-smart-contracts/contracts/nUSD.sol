// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract nUSD is ERC20 {
    AggregatorV3Interface internal priceFeed;

    string public constant _symbol = "nUSD";
    string public constant _name = "Ethereum backed USD pegged stablecoin";
    uint8 public constant _decimals = 8;

    constructor() ERC20(_name, _symbol) {
        priceFeed = AggregatorV3Interface(
            0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e
        );
    }

    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    //function that enables users to deposit eth and receive 50% of it value in nUSD.
    function depositETH() public payable {
        uint amountInUsd = ((msg.value * uint256(getLatestPrice())) / 2) *
            1 ether;
        _mint(msg.sender, amountInUsd);
    }

    //fucntion to get latest of eth usd using chainlink.
    function getLatestPrice() public view returns (int) {
        (, int price, , , ) = priceFeed.latestRoundData();
        return price;
    }

    function redeemETH(uint amountInCents) public payable {
        uint amountInWei = (amountInCents * 1 ether) /
            (2 * uint256(getLatestPrice()));
        _burn(msg.sender, amountInCents);
        payable(msg.sender).transfer(amountInWei);
    }
}
