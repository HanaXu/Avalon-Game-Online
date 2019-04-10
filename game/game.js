const GoodTeam = new Set(['Merlin', 'Loyal Servant of Arthur', 'Percival']);

// defines what type of characters for size of game
// key: number of players
// value: list of characters
const PlayerIdentities = {
  '5': [
    'Merlin',
    'Assassin',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Minion of Mordred'
  ],
  '5Percival': [
    'Merlin',
    'Assassin',
    'Percival',
    'Loyal Servant of Arthur',
    'Minion of Mordred'
  ],
  '5PercivalMordred': [
    'Merlin',
    'Assassin',
    'Percival',
    'Loyal Servant of Arthur',
    'Mordred'
  ],
  '5PercivalOberon': [
    'Merlin',
    'Assassin',
    'Percival',
    'Loyal Servant of Arthur',
    'Oberon'
  ],
  '5PercivalMorgana': [
    'Merlin',
    'Assassin',
    'Percival',
    'Loyal Servant of Arthur',
    'Morgana'
  ],
  '5Mordred': [
    'Merlin',
    'Assassin',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Mordred'
  ],
  '5Oberon': [
    'Merlin',
    'Assassin',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Oberon'
  ],
  '5Morgana': [
    'Merlin',
    'Assassin',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Morgana'
  ],
  6: [
    'Merlin',
    'Assassin',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Minion of Mordred'
  ],
  '6Percival': [
    'Merlin',
    'Assassin',
    'Percival',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Minion of Mordred'
  ],
  '6PercivalMordred': [
    'Merlin',
    'Assassin',
    'Percival',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Mordred'
  ],
  '6PercivalOberon': [
    'Merlin',
    'Assassin',
    'Percival',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Oberon'
  ],
  '6PercivalMorgana': [
    'Merlin',
    'Assassin',
    'Percival',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Morgana'
  ],
  '6Mordred': [
    'Merlin',
    'Assassin',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Mordred'
  ],
  '6Oberon': [
    'Merlin',
    'Assassin',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Oberon'
  ],
  '6Morgana': [
    'Merlin',
    'Assassin',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Morgana'
  ],
  7: [
    'Merlin',
    'Assassin',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Minion of Mordred',
    'Minion of Mordred'
  ],
  '7Percival': [
    'Merlin',
    'Assassin',
    'Percival',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Minion of Mordred',
    'Minion of Mordred'
  ],
  '7PercivalMordred': [
    'Merlin',
    'Assassin',
    'Percival',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Mordred',
    'Minion of Mordred'
  ],
  '7PercivalMordredOberon': [
    'Merlin',
    'Assassin',
    'Percival',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Mordred',
    'Oberon'
  ],
  '7PercivalMordredMorgana': [
    'Merlin',
    'Assassin',
    'Percival',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Mordred',
    'Morgana'
  ],
  '7PercivalOberon': [
    'Merlin',
    'Assassin',
    'Percival',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Oberon',
    'Minion of Mordred'
  ],
  '7PercivalOberonMorgana': [
    'Merlin',
    'Assassin',
    'Percival',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Oberon',
    'Morgana'
  ],
  '7PercivalMorgana': [
    'Merlin',
    'Assassin',
    'Percival',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Morgana',
    'Minion of Mordred'
  ],
  '7Mordred': [
    'Merlin',
    'Assassin',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Mordred',
    'Minion of Mordred'
  ],
  '7MordredOberon': [
    'Merlin',
    'Assassin',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Mordred',
    'Oberon'
  ],
  '7MordredMorgana': [
    'Merlin',
    'Assassin',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Mordred',
    'Morgana'
  ],
  '7Oberon': [
    'Merlin',
    'Assassin',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Oberon',
    'Minion of Mordred'
  ],
  '7OberonMorgana': [
    'Merlin',
    'Assassin',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Oberon',
    'Morgana'
  ],
  '7Morgana': [
    'Merlin',
    'Assassin',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Morgana',
    'Minion of Mordred'
  ],
  8: [
    'Merlin',
    'Assassin',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Minion of Mordred',
    'Minion of Mordred'
  ],
  '8Percival': [
    'Merlin',
    'Assassin',
    'Percival',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Minion of Mordred',
    'Minion of Mordred'
  ],
  '8PercivalMordred': [
    'Merlin',
    'Assassin',
    'Percival',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Mordred',
    'Minion of Mordred'
  ],
  '8PercivalMordredOberon': [
    'Merlin',
    'Assassin',
    'Percival',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Mordred',
    'Oberon'
  ],
  '8PercivalMordredMorgana': [
    'Merlin',
    'Assassin',
    'Percival',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Mordred',
    'Morgana'
  ],
  '8PercivalOberon': [
    'Merlin',
    'Assassin',
    'Percival',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Oberon',
    'Minion of Mordred'
  ],
  '8PercivalOberonMorgana': [
    'Merlin',
    'Assassin',
    'Percival',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Oberon',
    'Morgana'
  ],
  '8PercivalMorgana': [
    'Merlin',
    'Assassin',
    'Percival',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Morgana',
    'Minion of Mordred'
  ],
  '8Mordred': [
    'Merlin',
    'Assassin',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Mordred',
    'Minion of Mordred'
  ],
  '8MordredOberon': [
    'Merlin',
    'Assassin',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Mordred',
    'Oberon'
  ],
  '8MordredMorgana': [
    'Merlin',
    'Assassin',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Mordred',
    'Morgana'
  ],
  '8Oberon': [
    'Merlin',
    'Assassin',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Oberon',
    'Minion of Mordred'
  ],
  '8OberonMorgana': [
    'Merlin',
    'Assassin',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Oberon',
    'Morgana'
  ],
  '8Morgana': [
    'Merlin',
    'Assassin',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Morgana',
    'Minion of Mordred'
  ],
  9: [
    'Merlin',
    'Assassin',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Minion of Mordred',
    'Minion of Mordred'
  ],
  '9Percival': [
    'Merlin',
    'Assassin',
    'Percival',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Minion of Mordred',
    'Minion of Mordred'
  ],
  '9PercivalMordred': [
    'Merlin',
    'Assassin',
    'Percival',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Mordred',
    'Minion of Mordred'
  ],
  '9PercivalMordredOberon': [
    'Merlin',
    'Assassin',
    'Percival',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Mordred',
    'Oberon'
  ],
  '9PercivalMordredMorgana': [
    'Merlin',
    'Assassin',
    'Percival',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Mordred',
    'Morgana'
  ],
  '9PercivalOberon': [
    'Merlin',
    'Assassin',
    'Percival',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Oberon',
    'Minion of Mordred'
  ],
  '9PercivalOberonMorgana': [
    'Merlin',
    'Assassin',
    'Percival',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Oberon',
    'Morgana'
  ],
  '9PercivalMorgana': [
    'Merlin',
    'Assassin',
    'Percival',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Morgana',
    'Minion of Mordred'
  ],
  '9Mordred': [
    'Merlin',
    'Assassin',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Mordred',
    'Minion of Mordred'
  ],
  '9MordredOberon': [
    'Merlin',
    'Assassin',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Mordred',
    'Oberon'
  ],
  '9MordredMorgana': [
    'Merlin',
    'Assassin',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Mordred',
    'Morgana'
  ],
  '9Oberon': [
    'Merlin',
    'Assassin',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Oberon',
    'Minion of Mordred'
  ],
  '9OberonMorgana': [
    'Merlin',
    'Assassin',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Oberon',
    'Morgana'
  ],
  '9Morgana': [
    'Merlin',
    'Assassin',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Morgana',
    'Minion of Mordred'
  ],
  10: [
    'Merlin',
    'Assassin',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Minion of Mordred',
    'Minion of Mordred',
    'Minion of Mordred'
  ],
  '10Percival': [
    'Merlin',
    'Assassin',
    'Percival',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Minion of Mordred',
    'Minion of Mordred',
    'Minion of Mordred'
  ],
  '10PercivalMordred': [
    'Merlin',
    'Assassin',
    'Percival',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Mordred',
    'Minion of Mordred',
    'Minion of Mordred'
  ],
  '10PercivalMordredOberon': [
    'Merlin',
    'Assassin',
    'Percival',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Mordred',
    'Minion of Mordred',
    'Oberon'
  ],
  '10PercivalMordredMorgana': [
    'Merlin',
    'Assassin',
    'Percival',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Mordred',
    'Minion of Mordred',
    'Morgana'
  ],
  '10PercivalOberon': [
    'Merlin',
    'Assassin',
    'Percival',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Oberon',
    'Minion of Mordred',
    'Minion of Mordred'
  ],
  '10PercivalOberonMorgana': [
    'Merlin',
    'Assassin',
    'Percival',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Oberon',
    'Minion of Mordred',
    'Morgana'
  ],
  '10PercivalMordredOberonMorgana': [
    'Merlin',
    'Assassin',
    'Percival',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Oberon',
    'Mordred',
    'Morgana'
  ],
  '10PercivalMorgana': [
    'Merlin',
    'Assassin',
    'Percival',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Morgana',
    'Minion of Mordred',
    'Minion of Mordred'
  ],
  '10Mordred': [
    'Merlin',
    'Assassin',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Mordred',
    'Minion of Mordred',
    'Minion of Mordred'
  ],
  '10MordredOberon': [
    'Merlin',
    'Assassin',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Mordred',
    'Minion of Mordred',
    'Oberon'
  ],
  '10MordredOberonMorgana': [
    'Merlin',
    'Assassin',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Mordred',
    'Morgana',
    'Oberon'
  ],
  '10MordredMorgana': [
    'Merlin',
    'Assassin',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Mordred',
    'Minion of Mordred',
    'Morgana'
  ],
  '10Oberon': [
    'Merlin',
    'Assassin',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Oberon',
    'Minion of Mordred',
    'Minion of Mordred'
  ],
  '10OberonMorgana': [
    'Merlin',
    'Assassin',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Oberon',
    'Minion of Mordred',
    'Morgana'
  ],
  '10Morgana': [
    'Merlin',
    'Assassin',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Morgana',
    'Minion of Mordred',
    'Minion of Mordred'
  ]
};

module.exports = class Game {
  constructor(roomCode) {
    this.roomCode = roomCode;
    this.gameIsStarted = false;
    this.gameStage = 0;
    this.players = [];
    this.hasPercival = false;
    this.hasMordred = false;
    this.hasOberon = false;
    this.hasMorgana = false;
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
      }
      else if(clonedPlayers[i].character == 'Merlin' || clonedPlayers[i].character == 'Morgana' ) {
        //Merlin & Morgana both appear to be Merlin
        clonedPlayers[i].character = 'Merlin';
        clonedPlayers[i].team = 'Good';
      }
      else {
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
      }
      else if (GoodTeam.has(clonedPlayers[i].character) || clonedPlayers[i].character == "Oberon") {
        // hide good team's info (& Oberon)
        clonedPlayers[i].character = 'hidden';
        clonedPlayers[i].team = 'hidden';
      }
      else {
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
      }
      else if (GoodTeam.has(clonedPlayers[i].character) || clonedPlayers[i].character == "Mordred") {
        // hide good team's info (& Oberon)
        clonedPlayers[i].character = 'hidden';
        clonedPlayers[i].team = 'hidden';
      }
      else {
        //just hide character of your teammates
        clonedPlayers[i].character = 'hidden';
      }
    }
    return clonedPlayers;
  }

  // getter for PlayerIdentities
  static get PlayerIdentities() {
    return PlayerIdentities;
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

  // randomly assign a room leader in the player list.
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

  assignIdentities() {
    console.log('assignIdentities()');

    //keys in PlayerIdentities are in format of (PlayerCount)(Percival)(Mordred)(Oberon)(Morgana)
    //ex 6PercivalMorgana is a 6-player game with Percival and Morgana as optional characters
    var playerIdentitiesKey = this.players.length;
    var perc = "";
    var mord = "";
    var ober = "";
    var morg = "";
    if(this.hasPercival) {
      perc = "Percival";
    }
    if(this.hasMordred) {
      mord = "Mordred";
    }
    if(this.hasOberon) {
      ober = "Oberon";
    }
    if(this.hasMorgana) {
      morg = "Morgana";
    }
    const shuffledIdentities = this.shuffle(
      Game.PlayerIdentities[playerIdentitiesKey + perc + mord + ober + morg]
    );

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
};