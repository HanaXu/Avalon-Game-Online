/**
 * how many players will go on this quest, in the format of [questNum][total # players - 5]
 * ex: PLAYERS_ON_QUEST[0][0] = the first quest, with a 5 player game, will have 2 people on the Quest
 * @const {[][]}
 */
const PLAYERS_ON_QUEST = [
  //5 6 7 8 9 10 players
  [2, 2, 2, 3, 3, 3],
  [3, 3, 3, 4, 4, 4],
  [2, 4, 3, 4, 4, 4],
  [3, 3, 4, 5, 5, 5],
  [3, 4, 4, 5, 5, 5]
];

export default class Quest {
  /**
   * @param {number} questNum - Which quest players are on from 1 to 5
   * @param {number} totalNumPlayers - Total number of players in the room
   * @param {boolean} needsTwoFails - True if the quest requires 2 failing votes to fail, false if it only needs 1 (false by default)
   * @property {number} teamSize - Size of the quest’s team, based on above table
   * @property {set} playersOnQuest - Names of the players chosen to go on the quest
   * @property {number} playersNeededLeft - Remaining quest team size
   * @property {number} voteTrack - How many failed team votes for the quest, between 0 and 5
   * @property {Object} leaderInfo - The player leading the quest
   * @property {number} teamVotesNeededLeft - Remaining number of players who have yet to accept/reject the team
   * @property {Object} acceptOrRejectTeam - Names of players who accepted/rejected the quest team
   * @property {boolean} teamAccepted - Indicates if the quest team was accepted
   * @property {boolean} leaderHasConfirmedTeam - Indicates if the quest leader has confirmed the team
   * @property {boolean} currentQuest - Indicates if the quest is the current quest
   * @property {number} questVotesNeededLeft - Remaining number of players on the quest who have yet to fail/succeed it
   * @property {Object} votes - Number of votes indicating to fail or succeed the quest
   * @property {boolean} success - Indicates if the quest succeeded
   */
  constructor(questNum, totalNumPlayers, needsTwoFails=false) {
    this.questNum = questNum;
    this.totalNumPlayers = totalNumPlayers;
    this.teamSize = Quest.PLAYERS_ON_QUEST[questNum - 1][totalNumPlayers - 5];
    this.playersOnQuest = new Set([]);
    this.playersNeededLeft = this.teamSize;
    this.voteTrack = 0;
    this.leaderInfo = {
      'name': '',
      'socketID': null
    };
    this.teamVotesNeededLeft = totalNumPlayers;
    this.acceptOrRejectTeam = {
      'accept': [],
      'reject': []
    };
    this.teamAccepted = false;
    this.leaderHasConfirmedTeam = false;
    this.currentQuest = false;
    this.needsTwoFails = needsTwoFails;
    this.questVotesNeededLeft = this.teamSize;
    this.votes = {
      'questNum': this.questNum,
      'succeed': 0,
      'fail': 0
    };
    this.success = null;
  }

  static get PLAYERS_ON_QUEST() {
    return PLAYERS_ON_QUEST;
  }

  /**
   * @param {string} name 
   */
  addPlayer(name) {
    this.playersOnQuest.add(name);
    this.playersNeededLeft--;
  }

  /**
   * @param {string} name 
   */
  removePlayer(name) {
    this.playersOnQuest.delete(name);
    this.playersNeededLeft++;
  }

  /**
   * @param {string} playerName 
   * @param {string} decision 
   */
  addTeamVote({playerName, decision}) {
    this.acceptOrRejectTeam[decision].push(playerName);
    this.teamVotesNeededLeft--;
  }

  assignTeamResult() {
    this.teamAccepted = this.acceptOrRejectTeam.reject.length >= this.totalNumPlayers / 2;
    this.acceptOrRejectTeam.accept.sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }));
    this.acceptOrRejectTeam.reject.sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }));
  }

  /**
   * @param {Object} playerInfo 
   */
  assignLeaderInfo(playerInfo) {
    this.leaderInfo = playerInfo;
    this.currentQuest = true;
  }

  /**
   * @param {string} decision 
   */
  addQuestVote(decision) {
    this.votes[decision]++;
    this.questVotesNeededLeft--;
  }

  assignQuestResult() {
    this.success = !(this.needsTwoFails ? this.votes.fail >=2 : this.votes.fail > 0);
    return this.success;
  }

  //resets all values relating to players on quest & quest votes to original values
  resetQuest() {
    this.playersNeededLeft = this.teamSize;
    this.questVotesNeededLeft = this.teamSize;
    this.teamVotesNeededLeft = this.totalNumPlayers;
    this.playersOnQuest.clear();
    this.acceptOrRejectTeam = {
      'accept': [],
      'reject': []
    };
  }

}