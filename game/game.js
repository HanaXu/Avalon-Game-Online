var Quest = require('../game/Quest');

const GoodTeam = new Set(['Merlin', 'Loyal Servant of Arthur']);

// defines what type of characters for size of game
// key: number of players
// value: list of characters
const PlayerIdentities = {
  5: [
    'Merlin',
    'Assassin',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Minion of Mordred'
  ],
  6: [
    'Merlin',
    'Assassin',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Loyal Servant of Arthur',
    'Minion of Mordred'
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
  ]
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
    console.log('initializing quests. total players: ' + this.players.length)
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

  // hide all good team's characters
  sanitizeForEvilTeam() {
    const clonedPlayers = JSON.parse(JSON.stringify(this.players));
    for (const i in clonedPlayers) {
      if (GoodTeam.has(clonedPlayers[i].character)) {
        // hide good team's info
        clonedPlayers[i].character = 'hidden';
        clonedPlayers[i].team = 'hidden';
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
  assignLeaderToQuest(questNum) {
    console.log('assignLeader()');
    // const randomNumber = Math.floor(Math.random() * Math.floor(this.players.length));
    for (let i = 0; i < this.players.length; i++) {
      if (this.players[i] != null) {
        this.players[i].leader = true;
        this.quests[1].questLeader = this.players[i].name;
        this.quests[1].currentQuest = true;
        // console.log("Current leader is:");
        // console.log(this.players[i]);
        break;
      }
    }
    this.gameStage = 2;
  }

  assignIdentities() {
    console.log('assignIdentities()');
    const shuffledIdentities = this.shuffle(
      Game.PlayerIdentities[this.players.length]
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

// List of Player Identities, depending on how many players there are

/**
 * global variables for each of 5 quests
 * @var {Quest}
 */
/**
 * list containing each of 5 quests
 * @var {*[]}
 */

// --FUNCTIONS-----------------------------------------------------------------------------------------------------
/** @function Main
 * the main function for the game application; this will execute when host clicks Start Game
 * calls all of the game setup & game logic functions when needed
 */

/*
    function Main() {
        console.log("game.js: Main function initiated");

        // do game setup stuff (find out how many players there are, and in future will find out how many bots & any optional characters)
        //Need to figure out how to get the number of players in the game
        var numPlayers = 5;

        //give each player an identity
        assignIdentities();

        //this is the main game logic
        for(var questNum = 0; questNum < 5; questNum++) { //NOTE: questNum starts at 0, so quests[0] is what players will call Quest 1
            //loop through this until all quests are complete
            quests[questNum] = new Quest(questNum, 0);
            //stay on this quest until success or fail has been determined OR voteTrack reaches 5
            while(quests[questNum].success == null && quests[questNum].voteTrack < 5) {
                quests[questNum].chooseNextLeader();
                quests[questNum].questLeaderChooseTeam();
                quests[questNum].teamVote();
            }
            quests[questNum].saveQuestToHistory();
        }
        //do endgame stuff (count succeeded/failed quests, assassin tries to assassinate) to determine winner
        countQuestSuccesses();
        assassinate();
    }
    */

/** @function countQuestSuccesses
 * checks value of Quest.success for each quest in History
 * if there are 2 or more fails, sets goodGuysWin to false
 * else, calls assassinate()
 */

/*
    function countQuestSuccesses() {
        console.log("game.js: countQuestSuccesses()");
        //iterate over quest.success
    }
    *'
    /** @function assassinate
     * called by countQuestSuccesses
     * player with identity Assassin receives list of players on good team, selects the one they think is Merlin
     * if correct, goodGuysWin = false
     * if incorrect, goodGuysWin = true
     */
/*
    function assassinate() {
        console.log("game.js: assassinate()");
    }
}   */
