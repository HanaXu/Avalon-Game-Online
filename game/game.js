const GoodTeam = new Set(['Merlin', 'Loyal Servant of Arthur', 'Percival']);

// defines what type of characters for size of game
// key: number of players
// value: object of characters and how many
const BaseCharacters = {
  5: {
    Merlin: 1,
    Assassin: 1,
    'Loyal Servant of Arthur': 2,
    'Minion of Mordred': 1
  },
  6: {
    Merlin: 1,
    Assassin: 1,
    'Loyal Servant of Arthur': 3,
    'Minion of Mordred': 1
  },
  7: {
    Merlin: 1,
    Assassin: 1,
    'Loyal Servant of Arthur': 3,
    'Minion of Mordred': 2
  },
  8: {
    Merlin: 1,
    Assassin: 1,
    'Loyal Servant of Arthur': 4,
    'Minion of Mordred': 2
  },
  9: {
    Merlin: 1,
    Assassin: 1,
    'Loyal Servant of Arthur': 5,
    'Minion of Mordred': 2
  },
  10: {
    Merlin: 1,
    Assassin: 1,
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
    let quest1;
    let quest2;
    let quest3;
    let quest4;
    let quest5;
    const quests = [quest1, quest2, quest3, quest4, quest5];
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

  assignLeader() {
    console.log('assignLeader()');
    // const randomNumber = Math.floor(Math.random() * Math.floor(this.players.length));
    for (let i = 0; i < this.players.length; i++) {
      if (this.players[i] != null) {
        this.players[i].leader = true;
        // console.log("Current leader is:");
        // console.log(this.players[i]);
        break;
      }
    }
    this.gameStage = 2;
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
    } else {
      let teamObj = Game.BaseCharacters[this.players.length]
      shuffledIdentities = this.shuffle(this.objectToArray(teamObj));
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