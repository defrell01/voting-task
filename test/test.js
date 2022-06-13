/* eslint-disable prettier/prettier */
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("VotingServiceContract", function () {

    let VotingContract;
    let voting;
    let vId;
    let owner;
    let user1;
    let user2;
    let users;

    beforeEach(async function () {
        VotingContract = await ethers.getContractFactory("Votings");
        [owner, user1, user2, ...users] = await ethers.getSigners();
        voting = await VotingContract.deploy();
        const votingTransaction = await voting.createVoting();
        const rc = await votingTransaction.wait();

        const votingCreatedEvent = rc.events.find(event => event.event === 'votingCreated');
        [vId] = votingCreatedEvent.args;

    })

    describe("Voting", async function () {
        it("Should set the correct vID", async function () {
            const voting2Transaction = await voting.createVoting();
            const rc2 = await voting2Transaction.wait();
    
            const voting2CreatedEvent = rc2.events.find(event => event.event === 'votingCreated');
            const [voting2Id] = voting2CreatedEvent.args;
    
            await expect(voting2Id).to.equal(1);
        });
        it("Should revert creating voting not by the owner", async function () {
            await expect(voting.connect(user1).createVoting()).to.be.revertedWith("Not an owner");
        });


        it("Should initialize voting setting correctly", async function () {

            await expect(vId).to.equal(0);
            await expect(await voting.finishedInfo(vId)).to.equal(false);
        });

        it("Should revert attempts to vote with no deposit", async function () {

            await expect(voting.connect(user1).doVote(vId, user2.address)).to.be.revertedWith("Transfer 0.01 ETH in order to vote");
        })


        it("Should initialize voting setting correctly after smb voted", async function () {

            await voting.connect(user1).doVote(vId, user2.address, { value: ethers.utils.parseEther("0.01") });

            expect(await voting.numberInfo()).to.equal(1);
            expect(await voting.leaderInfo(vId)).to.equal(user2.address);
            expect(await voting.finishedInfo(vId)).to.equal(false);
        });

        it("Should revert revoting attempts", async function () {
            await voting.connect(user1).doVote(vId, user2.address, { value: ethers.utils.parseEther("0.01") });
            await expect(voting.connect(user1).doVote(vId, user2.address, { value: ethers.utils.parseEther("0.01") })).to.be.revertedWith("You have already voted!");
        });


        it("Should set the correct voting leader", async function () {

            for (let i = 0; i < 5; i++) {
                await voting.connect(users[i]).doVote(vId, user1.address, { value: ethers.utils.parseEther("0.01") });
            }

            for (let i = 5; i < 15; i++) {
                await voting.connect(users[i]).doVote(vId, user2.address, { value: ethers.utils.parseEther("0.01") });
            }

            for (let i = 15; i < 17; i++) {
                await voting.connect(users[i]).doVote(vId, users[0].address, { value: ethers.utils.parseEther("0.01") });
            }

            expect(await voting.leaderInfo(vId)).to.equal(user2.address);


        });

        it("Should revert early voting finishing", async function () {
            await expect(voting.finish(vId)).to.be.revertedWith('Could not be finish yet');
        });

        it("Should finish the voting correctly", async function () {
            await voting.connect(user1).doVote(vId, user2.address, { value: ethers.utils.parseEther("0.01") }); 

            await network.provider.send("evm_increaseTime", [60 * 60 * 24 * 3]); 

            await expect(await voting.finishedInfo(vId)).to.equal(false);  

            const leaderInitialBalance = await user1.getBalance();

            await voting.finish(vId);

            await expect(await user1.getBalance() > leaderInitialBalance); 
            await expect(await voting.finishedInfo(vId)).to.equal(true);  

        });

        it("Should revert non-owner withdraw attempts", async function () {
            await expect(voting.connect(user1).withdraw(user2.address)).to.be.revertedWith("Not an owner");
        });

        it("Should set the correct ending time", async function () {
            const endsAtDateTimestamp = await voting.connect(user1).endingInfo(vId);
            const endsAtDate = new Date(endsAtDateTimestamp * 1000);
            await expect(endsAtDate > Date.now());
        });

        it("Should be able to withdraw by owner", async function () {
            const owner_initial_balance = await owner.getBalance();

            await voting.connect(user1).doVote(vId, user2.address, { value: ethers.utils.parseEther("0.01") }); 

            await network.provider.send("evm_increaseTime", [60 * 60 * 24 * 3]);
            expect(await voting.finishedInfo(vId)).to.equal(false);
            await voting.finish(vId);

            await voting.withdraw(user2.address);

            await expect(await owner.getBalance() > owner_initial_balance);

        });

        it("Should revert attempts to vote after finishing voting", async function () {
            await voting.connect(user1).doVote(vId, user2.address, { value: ethers.utils.parseEther("0.01") }); 
            await network.provider.send("evm_increaseTime", [60 * 60 * 24 * 3]); 
            await voting.finish(vId);
            await expect(voting.connect(user2).doVote(vId, user2.address, { value: ethers.utils.parseEther("0.01") })).to.be.revertedWith("Voting is finished");
            await expect(await voting.finishedInfo(vId)).to.equal(true);

        });

        it("Should revert attempt to end ended voting", async function () {
            await voting.connect(user1).doVote(vId, user2.address, { value: ethers.utils.parseEther("0.01") }); 
            await network.provider.send("evm_increaseTime", [60 * 60 * 24 * 3]); 
            await voting.finish(vId);

            expect(voting.finish(vId)).to.be.revertedWith("Voting is already finished");
        });



    });
});