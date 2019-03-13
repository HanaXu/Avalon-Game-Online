

/** @function Main
 * the main function for the game application; this will execute when host clicks Start Game
 * calls all of the game setup & game logic functions when needed
 */
function Main() {

    // do game setup stuff (find out how many players there are, and in future will find out how many bots & any optional characters)

    //give each player an identity
    assignIdentities();

    //this is the main game logic
    for(var questNum = 1; questNum <= 5; questNum++) { //questNum starts at 1 so it matches internally what it'll be called for players
        //loop through this until all quests are complete
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
function assignIdentities() {}



/** @function countQuestSuccesses
 * checks value of Quest.success for each quest in History
 * if there are 2 or more fails, sets goodGuysWin to false
 * else, calls assassinate()
 */
function countQuestSuccesses() {}

/** @function assassinate
 * called by countQuestSuccesses
 * player with identity Assassin receives list of players on good team, selects the one they think is Merlin
 * if correct, goodGuysWin = false
 * if incorrect, goodGuysWin = true
 */
function assassinate() {}
