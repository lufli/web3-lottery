// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract Lottery {
    address public manager;
    address[] public players;

    event PlayerEntered(address indexed player);
    event WinnerPicked(address indexed winner, uint amount);

    constructor() {
        manager = msg.sender;
    }

    function enter() public payable {
        require(msg.value >= 0.01 ether, "Minimum entry is 0.01 ETH");
        players.push(msg.sender);
        emit PlayerEntered(msg.sender);
    }

    function getPlayers() public view returns (address[] memory) {
        return players;
    }

    function getBalance() public view returns (uint) {
        return address(this).balance;
    }

    function pickWinner() public onlyManager {
        require(players.length > 0, "No players in the lottery");

        uint randomIndex = uint(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, players))) % players.length;
        address winner = players[randomIndex];
        uint prize = address(this).balance;

        payable(winner).transfer(prize);
        emit WinnerPicked(winner, prize);

        // Reset
        players = new address payable[](0);
    }

    modifier onlyManager() {
        require(msg.sender == manager, "Only manager can call this");
        _;
    }
}