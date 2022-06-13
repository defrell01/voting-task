// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract Votings {
    
    ///STRUCTURES

    struct user {                               /// STRUCTURE OF ALL USERS 
        bool voted;                             /// AT THIS VOTING THEY CAN BE VOTERS AND CANDIDATES
        uint votes;                             /// VOTED - FOR VOTERS, VOTES - CANDIDATE VOTES AMOUNT
    }

    struct voting {                             /// STRUCTURE OF VOTING
        uint finishingBlock;                    /// CONTAINS INFO ABOUT FINISH TIME
        bool finished;                          /// CONTAINS A LEADER ADDRESS
        address leader;                         /// CONTAINS HIS VOTES 
        uint maxVotes;                          /// CONTAINS VOTING PRIZEPULL
        uint prizePull;                         /// AND ALL VOTING USERS
        mapping(address => user) users;
    }

    ///VARIABLES

    address public owner;
    mapping(uint256 => voting) public votings;
    uint256 votingsNumber;                      /// VOTINGS NUMBER IN ORDER TO FIND SPECIFIC ONE
    uint256 comissions;                         /// COMISSION HELD ON THE PLATFORM

    ///EVENTS

    event votingCreated(uint256 votingId);        
    event votingFinished(uint votingId);
    event transfered(address _to, uint value);

    ///MODIFIERS

    modifier ownerOnly {
        require(msg.sender == owner, "Not an owner");
        _;
    }

    modifier finishable(uint _vID) {
        voting storage v = votings[_vID];
        require(block.timestamp >= v.finishingBlock, "Could not be finish yet");          
        require(!v.finished, "Voting is already finished");
        _;

    }

    modifier votable (uint _vID) {
        require(msg.value == 0.01 ether, "Transfer 0.01 ETH in order to vote");
        voting storage v = votings[_vID];
        require(!v.finished, "Voting is finished");
        user storage voter = v.users[msg.sender];
        require(!voter.voted, "You have already voted!");    
        _;
    }

    ///FUNCTIONS

    constructor() payable {
        owner = msg.sender;
    }

    function createVoting()                                                 ///CREATE A VOTING WITH FIXED VOTING ID AND DURATION
    external
    ownerOnly 
    {
        uint _vID = votingsNumber;
        votings[_vID].finishingBlock = block.timestamp + 3 days;
        votingsNumber++;
        emit votingCreated(_vID);
    }

    function doVote(uint _vID, address payable _candidate)                  ///USER VOTES AND DELIGATES HIS CANDIDATE 
    external
    payable
    votable(_vID)
    {
        voting storage v = votings[_vID];
        user storage voter = v.users[msg.sender];                         ///USER BECOMES A VOTER
        user storage candidate = v.users[_candidate];                     // DELIGATED ONE BECOMES A CANDIDATE  
        voter.voted = true;
        candidate.votes++;
        v.prizePull += 0.009 ether;
        comissions += 0.001 ether;

        if (v.maxVotes < candidate.votes) {                              // IN ORDER NOT TO CALCULATE WINNER WHILE FINISHING AND HAVING PROBABLY PROBLEMATIC "FOR" CYCLE
            v.maxVotes = candidate.votes;                                // WE DO IT HERE
            v.leader = _candidate;
        }
    }

    function finish(uint _vID)                                /// BASICALY WE JUST FINISH THE VOTING
    external                                                  /// AND TRANSFER PRIZE PULL TO THE WINNER
    finishable(_vID)
    {
        voting storage v = votings[_vID];
        v.finished = true;
        payable(v.leader).transfer(v.prizePull);
        v.prizePull = 0;
        emit votingFinished(_vID);
    }
    
    function withdraw(address _to)                          /// WE WITHDRAW COMISSION HELD ON THE PLATFROM TO SOME ADDRESS
    external
    ownerOnly
    payable 
    {
        payable(_to).transfer(comissions);
        emit transfered(_to, comissions);
        comissions = 0;
    }

    ///INFO FUNCTIONS

    function numberInfo()
    external
    view
    returns (uint) 
    {
        return votingsNumber;
    }

    function finishedInfo(uint256 _vID)
    external
    view
    returns (bool) 
    {
        return votings[_vID].finished;
    }


    function endingInfo(uint _vID)
    public
    view
    returns (uint) 
    {
        return votings[_vID].finishingBlock;
    }
    
    function leaderInfo(uint _vID)
    public
    view 
    returns (address) 
    {
        return votings[_vID].leader;
    }


}