import { objectToArray, shuffle } from './utility.mjs';
import { Quest } from './quest.mjs';

export const GoodTeam = new Set(['Merlin', 'Loyal Servant of Arthur', 'Percival']);

// defines what type of characters for size of game
// key: number of players
// value: object of characters and how many
const BaseCharacters = {
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

export class Game {
  constructor(roomCode) {
    this.roomCode = roomCode;
    this.gameIsStarted = false;
    this.gameStage = 0;
    this.players = [];
    this.quests = null;
    this.leaderIndex = 0;
  }

  initializeQuests() {
    console.log(`initializing quests. total players: ${this.players.length}`);
    this.quests = {
      1: new Quest(1, this.players.length),
      2: new Quest(2, this.players.length),
      3: new Quest(3, this.players.length),
      4: new Quest(4, this.players.length),
      5: new Quest(5, this.players.length)
    };
    this.quests[1].currentQuest = true;
  }

  getCurrentQuest() {
    for (let i in this.quests) {
      if (this.quests[i].currentQuest === true) {
        return this.quests[i];
      }
    }
  }

  // getter for PlayerIdentities
  static get BaseCharacters() {
    return BaseCharacters;
  }

  // getter for GoodTeam
  static get GoodTeam() {
    return GoodTeam;
  }

  hasPlayerWithName(name) {
    for (let i in this.players) {
      if (this.players[i].name === name) {
        return true;
      }
    }
  }

  addPlayerToQuest(questNum, name) {
    for (let i in this.players) {
      if (this.players[i].name === name && this.quests[questNum].playersNeededLeft > 0) {
        this.players[i].onQuest = true;
        this.quests[questNum].playersOnQuest.add(name);
        this.quests[questNum].playersNeededLeft--;

        console.log(`${name} is now on the quest`);
        console.log(`players needed left: ${this.quests[questNum].playersNeededLeft}`);
        break;
      }
    }
  }

  removePlayerFromQuest(questNum, name) {
    for (let i in this.players) {
      if (this.players[i].name === name) {
        this.players[i].onQuest = false;
        this.quests[questNum].playersOnQuest.delete(name);
        this.quests[questNum].playersNeededLeft++;

        console.log(`${name} is no longer on the quest`);
        console.log(`players needed left: ${this.quests[questNum].playersNeededLeft}`);
        break;
      }
    }
  }

  deletePlayer(socketID) {
    for (let i in this.players) {
      if (this.players[i].socketID === socketID) {
        console.log(`removing player from room: ${this.roomCode}`);
        this.players.splice(i, 1); //delete 1 player element at index i
        break;
      }
    }
  }

  getHostSocketID() {
    for (let i in this.players) {
      if (this.players[i].role === 'Host') {
        console.log('Host socket found');
        return this.players[i].socketID;
      }
    }
  }

  // randomly assign a room leader in the player list.
  assignFirstLeader() {
    console.log('assignFirstLeader()');
    this.gameStage = 2;

    // const randomNumber = Math.floor(Math.random() * Math.floor(this.players.length));
    for (let i = 0; i < this.players.length; i++) {
      if (this.players[i] != null) {
        this.players[i].leader = true;
        this.leaderIndex = i;
        this.quests[1].leader.name = this.players[i].name;
        this.quests[1].leader.socketID = this.players[i].socketID;
        this.quests[1].currentQuest = true;
        break;
      }
    }
  }

  //assign next room leader (goes in order incrementally always)
  assignNextLeader(questNum) {
    console.log("assignNextLeader()");

    //reset prev leader Player object
    this.players[this.leaderIndex].leader = false;
    //reset players on quest
    this.resetPlayersOnQuest(questNum);

    //increment leaderIndex (mod by playerLength so it wraps around)
    this.leaderIndex = (this.leaderIndex + 1) % this.players.length;

    //continue incrementing leaderIndex until we find next non-null player object
    while (this.players[this.leaderIndex] === null) {
      this.leaderIndex = (this.leaderIndex + 1) % this.players.length;
    }
    //assign new leader to correct Player
    this.players[this.leaderIndex].leader = true;
    this.quests[questNum].leader.name = this.players[this.leaderIndex].name;
    this.quests[questNum].leader.socketID = this.players[this.leaderIndex].socketID;
    this.quests[questNum].currentQuest = true;
  }

  assignIdentities(optionalCharacters) {
    console.log('assignIdentities()');
    let shuffledIdentities;

    if (optionalCharacters.length > 0) {
      let newTeamObj = Game.BaseCharacters[this.players.length];

      for (let i = 0; i < optionalCharacters.length; i++) {
        if (optionalCharacters[i] === 'Percival') {
          newTeamObj['Loyal Servant of Arthur']--;
          newTeamObj['Percival'] = 1;
        } else if (optionalCharacters[i] === 'Mordred') {
          newTeamObj['Minion of Mordred']--;
          newTeamObj['Mordred'] = 1;
        } else if (optionalCharacters[i] === 'Oberon') {
          newTeamObj['Minion of Mordred']--;
          newTeamObj['Oberon'] = 1;
        } else if (optionalCharacters[i] === 'Morgana') {
          newTeamObj['Minion of Mordred']--;
          newTeamObj['Morgana'] = 1;
        }
      }
      shuffledIdentities = shuffle(objectToArray(newTeamObj));
      console.log(shuffledIdentities)
    } else {
      let teamObj = Game.BaseCharacters[this.players.length];
      shuffledIdentities = shuffle(objectToArray(teamObj));
      console.log(shuffledIdentities)
    }

    for (let i = 0; i < this.players.length; i++) {
      this.players[i].character = shuffledIdentities[i]; // assign character to player
      if (Game.GoodTeam.has(shuffledIdentities[i])) {
        this.players[i].team = 'Good'; // assign team based on character
      } else {
        this.players[i].team = 'Evil';
      }
    }
  }

  //resets all values relating to players on quest & quest votes to original values
  resetPlayersOnQuest(questNum) {
    for (let i in this.players) {
      this.players[i].onQuest = false;
    }

    let currentQuest = this.quests[questNum];
    currentQuest.resetQuest();
  }

  //move to next quest out of 5
  startNextQuest(lastQuestNum) {
    if(lastQuestNum < 5) {
      this.quests[lastQuestNum].currentQuest = false;
      this.quests[lastQuestNum + 1].currentQuest = true;

      //assign a leader
      this.assignNextLeader(lastQuestNum + 1);
    }
    else {
      //last quest is over, move to endgame
      console.log("Game over: Reached last quest.");
    }
  }

  //called after 5 quests completed
  //returns count of successes, fails, and boolean evilWins
  tallyQuestResults() {
    //tally up quest successes/fails
    let successCount = 0;
    let failCount = 0;
    for(let i = 1; i < 6; i++) {
      if(this.quests[i].success) {
        successCount++;
      }
      else if(this.quests[i].fail) {
        failCount++;
      }
    }
    console.log(`successCount: ${successCount}`);
    console.log(`failCount: ${failCount}`);
    //more succeeded quests than failed?
    if(successCount >= 3) {
      return({
        successes: successCount,
        fails: failCount,
        msg: "",
        gameOver: true,
        evilWins: false
      });
    }
    else if(failCount >=3) {
      let msg = `${failCount} quests failed.`;
      //this.endGameEvilWins(msg);
      return({
        successes: successCount,
        fails: failCount,
        msg: msg,
        gameOver: true,
        evilWins: true
      });
    }
    else {
      //game isn't over
      return({
        successes: successCount,
        fails: failCount,
        msg: "",
        gameOver: false,
        evilWins: false
      });
    }

  }

  //check if Assassinated player is Merlin
  checkIfMerlin(name) {
    for (let i = 0; i < this.players.length; i++) {
      if(this.players[i].name == name && this.players[i].character == "Merlin") {
        //successful assassination, evil wins
        this.endGameEvilWins(`Assassin successfully discovered and killed ${name}, who was Merlin.`);
        return(`Assassin successfully discovered and killed ${name}, who was Merlin.`);
      }
    }
    //failed assassination, good wins
    return(`Assassin failed to discover and kill Merlin. Good Wins!`);
  }

  //end the game in favor of evil
  //called when voteTrack hits 5, evil wins majority of quests, or assassinates Merlin
  endGameEvilWins(msg) {
    //reset everything
    console.log(`Evil Wins: ${msg}`);
  }

};
