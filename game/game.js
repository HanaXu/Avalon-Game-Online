//--GLOBAL VARS-----------------------------------------------------------------------------------------------------
/**
 * how many good vs evil players there will be
 * first param is 0 for good, 1 for evil
 * second param is [player count - 5]
 * ex. TEAM_COUNTS[0][0] is how many good players there will be when there are 5 players total
 * @type {[][]}
 */
const TEAM_COUNTS = [
    [3,4,4,5,6,6],
    [2,2,3,3,3,4]
];

/**
 * global variables for each of 5 quests
 * @var {Quest}
 */
var quest1, quest2, quest3, quest4, quest5;
/**
 * list containing each of 5 quests
 * @var {*[]}
 */
var quests = [quest1, quest2, quest3, quest4, quest5];



//--FUNCTIONS-----------------------------------------------------------------------------------------------------
/** @function Main
 * the main function for the game application; this will execute when host clicks Start Game
 * calls all of the game setup & game logic functions when needed
 */
function Main() {
    console.log("game.js: Main function initiated");

    // do game setup stuff (find out how many players there are, and in future will find out how many bots & any optional characters)

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


/** @function assignIdentities()
 * randomly assigns each player to Good or Evil team & gives them a specific identity
 * sets value of identity, onTeamGood, and knownIdentities for each Player object
 * sends identity and knownIdentities to UI for each player
 */
function assignIdentities() {
    console.log("game.js: assignIdentities()");
    //iterate over a list of player objects
}



/** @function countQuestSuccesses
 * checks value of Quest.success for each quest in History
 * if there are 2 or more fails, sets goodGuysWin to false
 * else, calls assassinate()
 */
function countQuestSuccesses() {
    console.log("game.js: countQuestSuccesses()");
    //iterate over quest.success
}

/** @function assassinate
 * called by countQuestSuccesses
 * player with identity Assassin receives list of players on good team, selects the one they think is Merlin
 * if correct, goodGuysWin = false
 * if incorrect, goodGuysWin = true
 */
function assassinate() {
    console.log("game.js: assassinate()");
}

/**
 * execute main function automatically when running game.js file (for easy testing in console):
 */
//Main();