/**
 * how many players will go on this quest, in the format of [questNum-1][total # players - 5]
 * ex: PLAYERS_ON_QUEST[0][0] = the first quest, with a 5 player game, will have 2 people on the Quest
 * @const {[][]}
 */
const PLAYERS_ON_QUEST = [
    [2,2,2,3,3,3],
    [3,3,3,4,4,4],
    [2,4,3,4,4,4],
    [3,3,4,5,5,5],
    [3,4,4,5,5,5]
];


/**
 * Class representing the current Quest being played
 */
class Quest {
    /**
     * @typedef {Object} Quest
     * @property {number} questNum - which quest players are on from 1 to 5
     * @property {number} teamSize - size of current quest’s team, based on below table
     * @property {number} voteTrack - how many failed votes have been for current quest, between 0 and 5
     * @property {Player} questLeader - the player leading the current quest
     * @property {Player[]} team - a list containing teamSize objects representing players
     * @property {boolean} needsTwoFails - true if this quest requires 2 failing votes to fail, false if it only needs 1 (false by default)
     * @property {boolean} success - true for a succeeded quest, false for failed quest
     */

    /** constructor for Quest object
     * creates a Quest object and:
     * initializes (or increments) questNum,
     * defines teamSize (based on table),
     * sets voteTrack to 0,
     * calls chooseNextLeader()
     */
    constructor() {}

    /** @function chooseNextLeader
     * chooses next player in list of players (going in order)
     * assigns that player to questLeader variable
     * location in ordered player list persists across quests
     */
    chooseNextLeader() {}

    /** @function questLeaderChooseTeam
     * @param questLeader the current Player leading the quest
     * sends the list of player names as checkboxes to questLeader’s UI
     * waits for questLeader to select teamSize number of players and submit
     * puts those player names in a list in the team variable
     * sends the list to ALL players
     */
     questLeaderChooseTeam(questLeader) {}

    /** @function teamVote
     * called after questLeaderChooseTeam
     * all players see team list and vote Yes or No on their screen, then the following logic executes
     */
    teamVote() {}

    /** @function teamGoOnQuest
     * called by teamVote function
     * receives Succeed or Fail votes from each Player in Team
     * displays the votes (stripped of Player identifiers) to all players
     * executes below logic to determine Success
     */
    teamGoOnQuest() {}

    /** @function saveQuestToHistory
     * executes after teamGoOnQuest
     * puts full Quest object into a list of Quest objects to be saved for later
     */
    saveQuestToHistory() {}

}
