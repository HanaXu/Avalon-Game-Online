const GoodTeam = new Set(["Merlin", "Loyal Servant of Arthur"]);

//defines what type of characters for size of game
//key: number of players
//value: list of characters
const PlayerIdentities = {
  "5": [
    "Merlin",
    "Assassin",
    "Loyal Servant of Arthur",
    "Loyal Servant of Arthur",
    "Minion of Mordred"
  ],
  "6": [
    "Merlin",
    "Assassin",
    "Loyal Servant of Arthur",
    "Loyal Servant of Arthur",
    "Loyal Servant of Arthur",
    "Minion of Mordred"
  ],
  "7": [
    "Merlin",
    "Assassin",
    "Loyal Servant of Arthur",
    "Loyal Servant of Arthur",
    "Loyal Servant of Arthur",
    "Minion of Mordred",
    "Minion of Mordred"
  ],
  "8": [
    "Merlin",
    "Assassin",
    "Loyal Servant of Arthur",
    "Loyal Servant of Arthur",
    "Loyal Servant of Arthur",
    "Loyal Servant of Arthur",
    "Minion of Mordred",
    "Minion of Mordred"
  ],
  "9": [
    "Merlin",
    "Assassin",
    "Loyal Servant of Arthur",
    "Loyal Servant of Arthur",
    "Loyal Servant of Arthur",
    "Loyal Servant of Arthur",
    "Loyal Servant of Arthur",
    "Minion of Mordred",
    "Minion of Mordred"
  ],
  "10": [
    "Merlin",
    "Assassin",
    "Loyal Servant of Arthur",
    "Loyal Servant of Arthur",
    "Loyal Servant of Arthur",
    "Loyal Servant of Arthur",
    "Loyal Servant of Arthur",
    "Minion of Mordred",
    "Minion of Mordred",
    "Minion of Mordred"
  ]
};

module.exports = class Game {
  constructor(roomCode) {
    this.roomCode = roomCode;
    this.gameIsClosed = 0; //false
    this.gameStage = 0;
    this.players = [];
    var quest1, quest2, quest3, quest4, quest5;
    var quests = [quest1, quest2, quest3, quest4, quest5];
  }

  //getter for PlayerIdentities
  static get PlayerIdentities() {
    return PlayerIdentities;
  }

  //getter for GoodTeam
  static get GoodTeam() {
    return GoodTeam;
  }

  //randomly assign a room leader in the player list.
  assignLeader() {
    console.log("assignLeader()");
    var randomNumber = Math.floor(
      Math.random() * Math.floor(this.players.length)
    );
    for (var i = 0; i < this.players.length; i++) {
      if (this.players[i] != null) {
        this.players[i].leader = true;
        console.log("Current leader is:");
        console.log(this.players[i]);
        break;
      }
    }
    this.gameStage = 2;
  }

  assignIdentities() {
    console.log("assignIdentities()");
    let shuffledIdentities = this.shuffle(Game.PlayerIdentities[this.players.length]);

    for (let i = 0; i < this.players.length; i++) {
      this.players[i].character = shuffledIdentities[i];
      if (Game.GoodTeam.has(shuffledIdentities[i])) {
        this.players[i].team = "Good";
      } else {
        this.players[i].team = "Evil";
      }
    }
  }

  shuffle(array) {
    var currentIndex = array.length,
      temporaryValue,
      randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
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

//List of Player Identities, depending on how many players there are

/**
 * global variables for each of 5 quests
 * @var {Quest}
 */
/**
 * list containing each of 5 quests
 * @var {*[]}
 */

//--FUNCTIONS-----------------------------------------------------------------------------------------------------
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
/** @function assignIdentities()
 * randomly assigns each player to Good or Evil team & gives them a specific identity
 * sets value of identity, onTeamGood, and knownIdentities for each Player object
 * sends identity and knownIdentities to UI for each player
 */

/**
 * @function shuffle()
 * @param array
 * Known as the Fisher-Yates shuffle, it shuffles the list of player identities to randomly assign the players their identities in
 * the assignIdentities() function
 */

/*
    
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
