require("@nomiclabs/hardhat-waffle");
require('solidity-coverage')
require('dotenv').config();
require('./tasks/tasks')
require("@nomiclabs/hardhat-etherscan");
require('solidity-coverage');

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

module.exports = {
  solidity: "0.8.4",
  settings: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  },
  networks: {
    hardhat: {
      chainId: 1337,
      initialBaseFeePerGas: 0     /// idk но coverage ругается на проблему, решение которой я нашел лишь в этом
     },
    rinkeby: {
      url: `https://eth-rinkeby.alchemyapi.io/v2/${process.env.ALCHEMY_KEY}`,
      accounts: [process.env.PRIVATE_KEY]
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
}