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
   * @property {number} questNum - Which quest players are on from 1 to 5
   * @property {number} totalNumPlayers - Number of players in the room
   * @property {number} teamSize - Size of current quest’s team, based on above table
   * @property {set} playersOnQuest - Set of names of players chosen to go on quest
   * @property {number} voteTrack - How many failed team votes for the current quest, between 0 and 5
   * @property {player} questLeader - The player leading the current quest
   * @property {boolean} needsTwoFails - True if this quest requires 2 failing votes to fail, false if it only needs 1 (false by default)
   * @property {boolean} success - True for a succeeded quest, false for failed quest
   */

  constructor(questNum, totalNumPlayers) {
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
    this.acceptOrRejectTeam = {
      'voted': [],
      'accept': [],
      'reject': []
    };
    this.leaderHasConfirmedTeam = false;
    this.currentQuest = false;
    this.needsTwoFails = false; // don't worry about this for now, we'll just have it always set to false since it's a "special case" rule
    this.votes = {
      'voted': [],
      'succeed': 0,
      'fail': 0
    };
    this.success = null;
  }

  static get PLAYERS_ON_QUEST() {
    return PLAYERS_ON_QUEST;
  }

  addPlayer(name) {
    this.playersOnQuest.add(name);
    this.playersNeededLeft--;
  }

  removePlayer(name) {
    this.playersOnQuest.delete(name);
    this.playersNeededLeft++;
  }

  assignLeaderInfo(playerInfo) {
    this.leaderInfo = playerInfo;
    this.currentQuest = true;
  }

  assignResult() {
    this.success = !this.votes.fail > 0;
  }

  //resets all values relating to players on quest & quest votes to original values
  resetQuest() {
    this.playersNeededLeft = this.teamSize;
    this.playersOnQuest.clear();
    this.acceptOrRejectTeam = {
      'voted': [],
      'accept': [],
      'reject': []
    };
  }

}