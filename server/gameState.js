/**
 * @function getGameState()
 * creates a JSON that contains the various data relevant to the current state of the game
 * @returns {{questsuccesses: *, gamestatus: *, questnumber: *}}
 */
function getGameState() {

    //retrieve various data relating to the current state of the game
    var questNum = getQuestNum();                     //current quest number, need actual function
    var questSuccessNum = countQuestSuccesses();      //number of successful quests so far, from game.js
    var isGameOver = getGameStatus();                 //checks if the game has ended, need actual function

    //JSON containing the data
    var gameData = {
        "questnumber" : questNum,
        "questsuccesses" : questSuccessNum,
        "gamestatus" : isGameOver
    };

    //returns the JSON object containing all current game data
    return gameData;
}