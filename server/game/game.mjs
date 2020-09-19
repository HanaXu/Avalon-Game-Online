import { objectToArray, shuffle, populateRoleList } from './utility.mjs';
import Player from './player.mjs';
import Quest from './quest.mjs';

export const GoodTeam = new Set(['Merlin', 'Loyal Servant of Arthur', 'Percival']);

// defines what type of character roles for size of game
// key: number of players
// value: object of game roles and how many
const BaseRoles = {
  5: {
    'Merlin': 1,
    'Assassin': 1,
    'Loyal Servant of Arthur': 2,
    'Minion of Mordred': 1
  },
  6: {
    'Merlin': 1,
    'Assassin': 1,
    'Loyal Servant of Arthur': 3,
    'Minion of Mordred': 1
  },
  7: {
    'Merlin': 1,
    'Assassin': 1,
    'Loyal Servant of Arthur': 3,
    'Minion of Mordred': 2
  },
  8: {
    'Merlin': 1,
    'Assassin': 1,
    'Loyal Servant of Arthur': 4,
    'Minion of Mordred': 2
  },
  9: {
    'Merlin': 1,
    'Assassin': 1,
    'Loyal Servant of Arthur': 5,
    'Minion of Mordred': 2
  },
  10: {
    'Merlin': 1,
    'Assassin': 1,
    'Loyal Servant of Arthur': 5,
    'Minion of Mordred': 3
  }
};

export default class Game {
  /**
   * @param {number} roomCode - Digits identifying which room the game is in
   * @property {array} chat - Chat history of the game
   * @property {boolean} isStarted - Indicates if the game has started
   * @property {Object} gameState - Values indicating various stages of the game
   * @property {Object} roleList - Key/value pair of roles (and how many of each role) for the game
   * @property {array} players
   * @property {array} spectators
   * @property {Object} quests
   * @property {number} questFails - Number of failed quests
   * @property {number} questSuccesses - Number of successful quests
   * @property {number} leaderIndex 
   * @property {boolean} winningTeam - 'Good' or 'Evil'
   */
  constructor(roomCode) {
    this.roomCode = roomCode;
    this.chat = [];
    this.isStarted = false;
    this.gameState = {
      gameStatusMsg: '',
      showAcceptOrRejectTeamBtns: false,
      showSucceedOrFailQuestBtns: false
    };
    this.roleList = {};
    this.players = [];
    this.spectators = [];
    this.quests = {};
    this.currentQuestNum = null;
    this.questFails = 0;
    this.questSuccesses = 0;
    this.leaderIndex = 0;
    this.winningTeam = null;
    this.deleteRoomTimeout = null;
  }

  static get BaseRoles() {
    return BaseRoles;
  }
  static get GoodTeam() {
    return GoodTeam;
  }

  /**
   * @param {Object} optionalRoles 
   */
  startGame(optionalRoles) {
    this.isStarted = true;
    // shuffle(this.players);
    this.initializeQuests();
    this.assignRoles(optionalRoles);
  }

  resetGame() {
    this.resetPlayers();
    this.isStarted = false;
    this.gameState = {
      gameStatusMsg: '',
      showAcceptOrRejectTeamBtns: false,
      showSucceedOrFailQuestBtns: false
    };
    this.roleList = {};
    this.quests = {};
    this.questFails = 0;
    this.questSuccesses = 0;
    this.leaderIndex = 0;
    this.winningTeam = null;
    this.deleteRoomTimeout = null;
  }

  initializeQuests() {
    this.quests = {
      1: new Quest(1, this.players.length),
      2: new Quest(2, this.players.length),
      3: new Quest(3, this.players.length),
      4: new Quest(4, this.players.length, this.players.length > 6),
      5: new Quest(5, this.players.length)
    };
    this.currentQuestNum = 1;
    this.players[0].leader = true;
    this.quests[1].currentQuest = true;
    this.quests[1].assignLeaderInfo({
      name: this.players[0].name,
      socketID: this.players[0].socketID
    });
  }

  /**
   * @param {string} type - 'player' or 'spectator'
   * @param {string} socketID 
   * @param {string} name 
   * @param {string} isRoomHost 
   * @returns {Object}
   */
  addPerson({ type, socketID, name, isRoomHost }) {
    let msg;
    switch (type) {
      case 'player':
        this.players.push(new Player(socketID, name, isRoomHost));
        msg = { id: Date.now(), serverMsg: `${name} has joined the game.` };
        break;
      case 'spectator':
        this.spectators.push(new Player(socketID, name, isRoomHost));
        msg = { id: Date.now(), serverMsg: `${name} is spectating the game.` };
        break;
    }
    this.chat.push(msg);
    return msg;
  }

  /**
   * @param {string} key 
   * @param {string} value
   * @returns {Player}
   */
  getPlayer(key, value) {
    return this.players.find(player => player[key] === value);
  }

  /**
   * @param {string} key 
   * @param {string} value
   * @returns {Player}
   */
  getSpectator(key, value) {
    return this.spectators.find(spectator => spectator[key] === value);
  }

  /**
   * @returns {Quest}
   */
  getCurrentQuest() {
    return this.quests[this.currentQuestNum];
  }

  /**
   * @param {string} action
   * @param {string} name
   * @returns {boolean}
   */
  addRemovePlayerFromQuest(action, name) {
    let player = this.getPlayer('name', name);

    if (action === 'add' && player && !player.onQuest && this.getCurrentQuest().playersNeededLeft > 0) {
      this.getCurrentQuest().addPlayer(name);
      player.onQuest = true;
      return true;
    }
    else if (action === 'remove' && player && player.onQuest) {
      this.getCurrentQuest().removePlayer(name);
      player.onQuest = false;
      return true;
    }
    return false;
  }

  /**
   * @param {string} to - 'team' or 'quest'
   * @param {string} socketID 
   * @param {string} decision 
   * @returns {boolean}
   */
  addVote(to, socketID, decision) {
    let player = this.getPlayer('socketID', socketID);
    if (player && !player.voted) {
      switch (to) {
        case 'team':
          this.getCurrentQuest().addTeamVote(player.name, decision);
          break;
        case 'quest':
          this.getCurrentQuest().addQuestVote(decision);
          break;
      }
      player.voted = true;
      return true;
    }
    return false;
  }

  assignTeamResult() {
    this.getCurrentQuest().assignTeamResult();
  }

  /**
   * @returns {Object}
   */
  assignQuestResult() {
    const { questNum, success, currentQuest } = this.getCurrentQuest().assignQuestResult();
    success ? this.questSuccesses++ : this.questFails++;
    return {
      questNum, success, currentQuest
    }
  }

  /**
   * @param {string} socketID 
   * @param {string} name 
   * @returns {boolean}
   */
  assassinatePlayer(name) {
    let playerToAssassinate = this.getPlayer('name', name);
    if (playerToAssassinate && playerToAssassinate.team === 'Good') {
      playerToAssassinate.assassinated = true;
      playerToAssassinate.role === 'Merlin' ? this.winningTeam = 'Evil' : this.winningTeam = 'Good';
      return true;
    }
    return false;
  }

  /**
   * @returns {boolean}
   */
  gameOver() {
    if (this.questSuccesses >= 3) {
      return true;
    }
    else if (this.questFails >= 3 || this.getCurrentQuest().voteTrack > 5) {
      this.winningTeam = 'Evil';
      return true;
    }
    return false;
  }

  /**
   * @param {string} name
   * @returns {boolean} 
   */
  nameIsTaken(name) {
    return this.players.some(player => player.name === name) ||
      this.spectators.some(spectator => spectator.name === name);
  }

  /**
   * @param {string} arrayName
   * @param {string} socketID 
   */
  deletePersonFrom(arrayName, socketID) {
    for (let i in this[arrayName]) {
      if (this[arrayName][i].socketID === socketID) {
        this[arrayName].splice(i, 1); //delete 1 element at index i
        break;
      }
    }
  }

  resetPlayers() {
    this.players = this.players.filter(player => !player.disconnected);
    this.players.forEach(player => player.reset());
  }

  /**
   * @returns {Player}
   */
  assignNextHost() {
    this.players[0].isRoomHost = true;
    return this.players[0];
  }

  assignNextLeader() {
    this.players[this.leaderIndex].leader = false; //reset prev leader Player object
    this.resetPlayersProperty('onQuest');
    this.getCurrentQuest().resetQuest();

    //increment leaderIndex (mod by playerLength so it wraps around)
    this.leaderIndex = (this.leaderIndex + 1) % this.players.length;

    //continue incrementing leaderIndex until we find next non-null player object
    while (this.players[this.leaderIndex] === null) {
      this.leaderIndex = (this.leaderIndex + 1) % this.players.length;
    }
    //assign new leader to correct Player
    this.players[this.leaderIndex].leader = true;
    this.getCurrentQuest().assignLeaderInfo({
      name: this.players[this.leaderIndex].name,
      socketID: this.players[this.leaderIndex].socketID
    });
  }

  startNextQuest() {
    if (this.currentQuestNum < 5) {
      this.quests[this.currentQuestNum].currentQuest = false;
      this.quests[this.currentQuestNum += 1].currentQuest = true;
      this.assignNextLeader();
    }
  }

  /**
   * @param {Object} optionalRoles 
   */
  assignRoles(optionalRoles) {
    let shuffledIdentities;
    let teamObj = JSON.parse(JSON.stringify(Game.BaseRoles[this.players.length]));
    if (optionalRoles.length > 0) {
      optionalRoles.forEach(optionalRole => {
        switch (optionalRole) {
          case 'Percival':
            teamObj['Loyal Servant of Arthur']--;
            teamObj['Percival'] = 1;
            break;
          case 'Mordred':
            teamObj['Minion of Mordred']--;
            teamObj['Mordred'] = 1;
            break;
          case 'Oberon':
            teamObj['Minion of Mordred']--;
            teamObj['Oberon'] = 1;
            break;
          case 'Morgana':
            teamObj['Minion of Mordred']--;
            teamObj['Morgana'] = 1;
            break;
        }
      });
    }
    this.roleList = populateRoleList(teamObj);
    shuffledIdentities = shuffle(objectToArray(teamObj));
    for (let i in this.players) {
      this.players[i].role = shuffledIdentities[i];
      this.players[i].team = Game.GoodTeam.has(shuffledIdentities[i]) ? 'Good' : 'Evil';
    }
  }

  /**
   * @param {string} property 
   */
  resetPlayersProperty(property) {
    this.players.forEach(player => {
      player[property] = false;
    });
  }

}
