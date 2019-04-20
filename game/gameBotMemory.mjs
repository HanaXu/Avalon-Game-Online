export class GameBotMemory {

  /**
   * constructor for bot memory object
   */
  constructor(players) {
    this.players = players;
    this.numOfPlayers = players.length;
    this.quest1LeaderPicks = [[],[]]; //first array index is the player and the second array index is their picks
    this.quest1VoteDecision = [[],[]]; //first array index is the player and the second is their vote decision
    this.quest1QuestDecision = [[],[]]; //first array index is the player and the second is their quest decision.
    this.quest2LeaderPicks = [[],[]]; //and so on..
    this.quest2VoteDecision = [[],[]];
    this.quest2QuestDecision = [[],[]];
    this.quest3LeaderPicks = [[],[]];
    this.quest3VoteDecision = [[],[]];
    this.quest3QuestDecision = [[],[]];
    this.quest4LeaderPicks = [[],[]];
    this.quest4VoteDecision = [[],[]];
    this.quest4QuestDecision = [[],[]];
    this.quest5LeaderPicks = [[],[]];
    this.quest5VoteDecision = [[],[]];
    this.quest5QuestDecision = [[],[]];
  }
};


