var Quest = require('../game/Quest');

const GoodTeam = new Set(['Merlin', 'Loyal Servant of Arthur', 'Percival']);

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

module.exports = class Game {
  constructor(roomCode) {
    this.roomCode = roomCode;
    this.gameIsStarted = false;
    this.gameStage = 0;
    this.players = [];
    this.quests = null;
  }

  initializeQuests() {
    console.log('initializing quests. total players: ' + this.players.length);
    this.quests = {
      1: new Quest(1, this.players.length),
      2: new Quest(2, this.players.length),
      3: new Quest(3, this.players.length),
      4: new Quest(4, this.players.length),
      5: new Quest(5, this.players.length)
    };
  }

  getCurrentQuest() {
    for (let i in this.quests) {
      if (this.quests[i].currentQuest === true) {
        return this.quests[i];
      }
    }
  }

  // hide all player team and character info but yourself
  sanitizeForGoodTeam(yourSocketID) {
    const clonedPlayers = JSON.parse(JSON.stringify(this.players));

    for (const i in clonedPlayers) {
      if (clonedPlayers[i].socketID === yourSocketID) {
        // dont hide your own info
        continue;
      } else {
        // hide everyone else's info
        clonedPlayers[i].character = 'hidden';
        clonedPlayers[i].team = 'hidden';
      }
    }
    return clonedPlayers;
  }

  sanitizeForPercival(yourSocketID) {
    const clonedPlayers = JSON.parse(JSON.stringify(this.players));

    for (const i in clonedPlayers) {
      if (clonedPlayers[i].socketID === yourSocketID) {
        // dont hide your own info
        continue;
      } else if (
        clonedPlayers[i].character == 'Merlin' ||
        clonedPlayers[i].character == 'Morgana'
      ) {
        //Merlin & Morgana both appear to be Merlin
        clonedPlayers[i].character = 'Merlin';
        clonedPlayers[i].team = 'Good';
      } else {
        // hide everyone else's info
        clonedPlayers[i].character = 'hidden';
        clonedPlayers[i].team = 'hidden';
      }
    }
    return clonedPlayers;
  }

  // hide identities of good team & Oberon
  sanitizeForEvilTeam(yourSocketID) {
    const clonedPlayers = JSON.parse(JSON.stringify(this.players));
    for (const i in clonedPlayers) {
      if (clonedPlayers[i].socketID === yourSocketID) {
        // dont hide your own info
        continue;
      } else if (
        GoodTeam.has(clonedPlayers[i].character) ||
        clonedPlayers[i].character == 'Oberon'
      ) {
        // hide good team's info (& Oberon)
        clonedPlayers[i].character = 'hidden';
        clonedPlayers[i].team = 'hidden';
      } else {
        //just hide character of your teammates
        clonedPlayers[i].character = 'hidden';
      }
    }
    return clonedPlayers;
  }

  // hide identities of good team & Morgana
  sanitizeForMerlin(yourSocketID) {
    const clonedPlayers = JSON.parse(JSON.stringify(this.players));
    for (const i in clonedPlayers) {
      if (clonedPlayers[i].socketID === yourSocketID) {
        // dont hide your own info
        continue;
      } else if (
        GoodTeam.has(clonedPlayers[i].character) ||
        clonedPlayers[i].character == 'Mordred'
      ) {
        // hide good team's info (& Oberon)
        clonedPlayers[i].character = 'hidden';
        clonedPlayers[i].team = 'hidden';
      } else {
        //just hide character of your teammates
        clonedPlayers[i].character = 'hidden';
      }
    }
    return clonedPlayers;
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
    let playersNeededLeft =
      this.quests[questNum].playersNeeded -
      this.quests[questNum].playersOnQuest.size;
    for (let i in this.players) {
      if (this.players[i].name === name && playersNeededLeft > 0) {
        this.players[i].onQuest = true;
        console.log(name + ' is now on the quest');
        this.quests[questNum].playersOnQuest.players.add(name);
        this.quests[questNum].playersOnQuest.size++;
        playersNeededLeft--;
        console.log('players needed left: ' + playersNeededLeft);
        break;
      }
    }
    return playersNeededLeft;
  }

  removePlayerFromQuest(questNum, name) {
    let playersNeededLeft =
      this.quests[questNum].playersNeeded -
      this.quests[questNum].playersOnQuest.size;
    for (let i in this.players) {
      if (this.players[i].name === name) {
        this.players[i].onQuest = false;
        console.log(name + ' is no longer on the quest');
        this.quests[questNum].playersOnQuest.players.delete(name);
        this.quests[questNum].playersOnQuest.size--;
        playersNeededLeft++;
        console.log('players needed left: ' + playersNeededLeft);
        break;
      }
    }
    return playersNeededLeft;
  }

  deletePlayer(socketID) {
    for (let i in this.players) {
      if (this.players[i].socketID === socketID) {
        console.log('removing player from room: ' + this.roomCode);
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
  assignLeaderToQuest(questNum) {
    console.log('assignLeader()');
    this.gameStage = 2;

    // const randomNumber = Math.floor(Math.random() * Math.floor(this.players.length));
    for (let i = 0; i < this.players.length; i++) {
      if (this.players[i] != null) {
        this.players[i].leader = true;
        this.quests[1].questLeader = this.players[i].name;
        this.quests[1].currentQuest = true;
        // console.log("Current leader is:");
        // console.log(this.players[i]);
        return this.players[i].socketID; //return quest leader socketID
      }
    }
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
      shuffledIdentities = this.shuffle(this.objectToArray(newTeamObj));
      console.log(shuffledIdentities)
    } else {
      let teamObj = Game.BaseCharacters[this.players.length];
      shuffledIdentities = this.shuffle(this.objectToArray(teamObj));
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

  //check to make sure chosen optional characters works for number of players
  //if 5 or 6 players, cannot have more than 1 of Mordred, Oberon, and Morgana
  validateOptionalCharacters(characters) {
    console.log(characters)
    if (this.players.length <= 6 &&
      ((characters.includes("Mordred") && characters.includes("Oberon")) ||
        characters.includes("Mordred") && characters.includes("Morgana")) ||
      characters.includes("Oberon") && characters.includes("Morgana")) {
      return "Error: game with 5 or 6 players can only include 1 of Mordred, Oberon, or Morgana. Please select only one then click Start Game again.";
    }
    else if (
      this.players.length > 6 &&
      this.players.length < 10 &&
      characters.includes("Mordred") &&
      characters.includes("Oberon") &&
      characters.includes("Morgana")
    ) {
      return "Error: game with 7, 8, or 9 players can only include 2 of Mordred, Oberon, or Morgana. Please de-select one then click Start Game again.";
    } else {
      return ""
    }
  }

  // Fisher-Yates shuffle
  shuffle(array) {
    let currentIndex = array.length;
    let temporaryValue;
    let randomIndex;

    // While there remain elements to shuffle...
    while (currentIndex !== 0) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
    return array;
  }

  //convert the object to array for shuffling
  objectToArray(team) {
    let arr = []
    for (let character in team) {
      for (var i = 0; i < team[character]; i++) {
        arr.push(character)
      }
    }
    return arr;
  }
};
