/* eslint-disable prettier/prettier */
const { task } = require ('hardhat/config');
require('dotenv').config();

const sum = "" + 1e16;

async function getOwner() {
    const [owner] = await hre.ethers.getSigners();
    return owner;
}

async function getContract(address) {
    const abi = require('../artifacts/contracts/Votings.sol/Votings.json');

    const voting = new hre.ethers.Contract(
        address,
        abi.abi,
        await getOwner()
    )

    return voting;
}

task ("createVoting", "Creates new voting")
  .addParam("contract", "contract address")
  .setAction(async (taskArgs) => {
    try {
      const voting = await getContract(taskArgs.contract);
      await voting.createVoting();
      
      console.log("\nVoting has been created\n");
    }
    catch (error){
      console.log("\nERROR\n");
    }
  })

task ("vote", "Vote for a candidate")
  .addParam("contract", "contract address")
  .addParam("vid", "voting id")
  .addParam("candidate", "candidate address")
  .setAction(async (taskArgs) => {
    try {
      const voting = await getContract(taskArgs.contract);
      await voting.doVote(taskArgs.vid, taskArgs.candidate);

      console.log(`\n You have vote for ${taskArgs.candidate} from ${taskArgs.vid} voting \n`);
    }

    catch (error) {
      console.log(`\n ERROR \n`);
    }
})

task ("finish", "Finishes voting")
  .addParam("contract", "contract address")
  .addParam("vid", "voting id")
  .setAction(async (taskArgs) => {
    try {
      const voting = await getContract(taskArgs.contract);
      await voting.finish(taskArgs.vid);

      console.log(`\n You have finished ${taskArgs.vid} voting \n`);
    }

    catch (error) {
      console.log(`\n ERROR \n`);
    }
})

task ("transfer", "Transfers commisions from the contract")
  .addParam("contract", "contract address")
  .addParam("address", "transfer address")
  .setAction(async (taskArgs) => {
    try {
      const voting = await getContract(taskArgs.contract);
      await voting.withdraw(taskArgs.address);

      console.log(`\n You have transfered all the commision to ${taskArgs.address} \n`);
    }

    catch (error) {
      console.log(`\n ERROR \n`);
    }
})

task ("vinfo", "Views info about voting")
  .addParam("contract", "contract address")
  .addParam("vid", "voting id")
  .setAction(async (taskArgs) => {
    try {
      const voting = await getContract(taskArgs.contract);
      let result = await voting.numbersInfo();

      console.log(`\n Votings number  ${result} \n`);

      result = await voting.leaderInfo(taskArgs.vid);
      console.log(`\n Leader of ${taskArgs.vid} is ${result} \n`);
      
      result = await voting.ndingInfo(taskArgs.vid);
      console.log(`\n ${taskArgs.vid} voting finishes in ${result} \n`);
    }

    catch (error) {
      console.log(`\n ERROR \n`);
    }
})