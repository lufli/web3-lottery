import { expect } from "chai";
import hre from "hardhat";

describe("Lock", function () {
  let lottery;
  let accounts;
  let manager;

  beforeEach(async function () {
    const Lottery = await hre.ethers.getContractFactory("Lottery");
    lottery = await Lottery.deploy();
    accounts = await hre.ethers.getSigners();
    manager = accounts[0];
  })

  it("deploy Lottery contract correctly", async function () {
    expect(lottery.target).to.be.a("string");
    expect(await lottery.manager()).to.equal(manager.address);

    const players = await lottery.getPlayers();
    expect(players.length).to.equal(0);
  });

  it("allow one account to enter the lottery", async function () {
    const player = accounts[1]; // pick a player from accounts

    expect(await lottery.connect(player).enter({ value: hre.ethers.parseEther("0.02") }))
      .to.emit(lottery, "PlayerEntered") // PlayerEntered event fired
      .withArgs(player.address);
    
    const players = await lottery.getPlayers();

    expect(players.length).to.equal(1); // players list length is 1
    expect(players[0]).to.equal(player.address); // player's address is correct
    expect(await hre.ethers.provider.getBalance(await lottery.getAddress())).to.equal(hre.ethers.parseEther("0.02")); // contract address received payment
  });

  it("allow multiple accounts to enter the lottery", async function () {
    const player1 = accounts[1];
    expect(await lottery.connect(player1).enter({ value: hre.ethers.parseEther("0.01") }))
      .to.emit(lottery, "PlayerEntered") // PlayerEntered event fired
      .withArgs(player1.address);

    const player2 = accounts[2];
    expect(await lottery.connect(player2).enter({ value: hre.ethers.parseEther("0.02") }))
      .to.emit(lottery, "PlayerEntered") // PlayerEntered event fired
      .withArgs(player2.address);

    const player3 = accounts[3];
    expect(await lottery.connect(player3).enter({ value: hre.ethers.parseEther("0.03") }))
      .to.emit(lottery, "PlayerEntered") // PlayerEntered event fired
      .withArgs(player3.address);

    const players = await lottery.getPlayers();

    expect(players.length).to.equal(3); // players list length is 3
    expect(await hre.ethers.provider.getBalance(await lottery.getAddress())).to.equal(hre.ethers.parseEther("0.06")); // contract address received payment
  });

  it("requires a minimum to enter the lottery", async function () {
    const player = accounts[1];

    await expect(
      lottery.connect(player).enter({ value: hre.ethers.parseEther("0.009") })
    ).to.be.revertedWith("Minimum entry is 0.01 ETH");

    const players = await lottery.getPlayers();

    expect(players.length).to.equal(0); // players list length is 0 
    expect(await hre.ethers.provider.getBalance(await lottery.getAddress())).to.equal(hre.ethers.parseEther("0")); // contract address received payment
  });

  it("only manager can call pickWinner", async function () {
    await lottery.connect(accounts[1]).enter({ value: hre.ethers.parseEther("0.02")});
    await expect(lottery.connect(accounts[2]).pickWinner()).to.be.reverted;
  });

  it("send money in the pool to the winner and reset the game", async function () {
    await lottery.connect(accounts[1]).enter({ value: hre.ethers.parseEther("0.02") });
    await lottery.connect(accounts[2]).enter({ value: hre.ethers.parseEther("0.03") });
    expect(await hre.ethers.provider.getBalance(await lottery.getAddress())).to.equal(hre.ethers.parseEther("0.05"));

    await lottery.connect(manager).pickWinner();
    expect(await hre.ethers.provider.getBalance(await lottery.getAddress())).to.equal(hre.ethers.parseEther("0"));
  });
});