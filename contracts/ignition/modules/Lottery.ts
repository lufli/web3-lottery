const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
     
module.exports = buildModule("LotteryModule", (m) => {
  // This line will console log the ABI during deployment so it can be copied to the React app
  console.log(
    JSON.stringify(
      require("../../artifacts/contracts/Lottery.sol/Lottery.json").abi
    )
  );
 
  const lottery = m.contract("Lottery", []);
  return { lottery };
});