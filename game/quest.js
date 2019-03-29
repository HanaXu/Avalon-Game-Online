/**
 * how many players will go on this quest, in the format of [questNum][total # players - 5]
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
 * playerCount - the number of players in the whole game
 * @var {number}
 */
var playerCount = 5; //todo: update this to a normal variable (rn it's set to always 5 players)

/**
 * leaderTrack is where in the list of players we are
 * continues counting across all quests (so like a static variable)
 * @var {number}
 */
var leaderTrack = 0;

/**
 * Class representing the current Quest being played
 */
class Quest {
    /**
     * Quest objects have:
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
    constructor(questNum, voteTrack) {
        this.questNum = questNum;
        this.teamSize = PLAYERS_ON_QUEST[questNum ][playerCount - 5];
        this.voteTrack = voteTrack;
        this.questLeader = "";
        this.needsTwoFails = false; // don't worry about this for now, we'll just have it always set to false since it's a "special case" rule
        this.success = null;
        console.log("quest.js: constructor() created quest with questNum = " + questNum);
    }

    /** @function chooseNextLeader
     * chooses next player in list of players (going in order)
     * assigns that player to questLeader variable
     * location in ordered player list persists across quests
     */
    chooseNextLeader() {
        leaderTrack = (leaderTrack + 1) % playerCount;
        console.log("quest.js: chooseNextLeader() set leaderTrack = " + leaderTrack);
    }

    /** @function questLeaderChooseTeam
     * @param questLeader the current Player leading the quest
     * sends the list of player names as checkboxes to questLeader’s UI
     * waits for questLeader to select teamSize number of players and submit
     * puts those player names in a list in the team variable
     * sends the list to ALL players
     */
     questLeaderChooseTeam() {
         console.log("quest.js: questLeaderChooseTeam()");
    }

    /** @function teamVote
     * called after questLeaderChooseTeam
     * all players see team list and vote Yes or No on their screen, then the following logic executes
     * @return {boolean} true for succeeded quest, false for failed
     */
    teamVote() {
        console.log("quest.js: teamVote()");
        //todo: make it only do teamGoOnQuest IF vote resolves to > 50% approval & if the vote fails, it increments voteTrack instead
        this.teamGoOnQuest();
    }

    /** @function teamGoOnQuest
     * called by teamVote function
     * receives Succeed or Fail votes from each Player in Team
     * displays the votes (stripped of Player identifiers) to all players
     * executes below logic to determine Success
     */
    teamGoOnQuest() {
        console.log("quest.js: teamGoOnQuest()");

        //todo: make success of quest conditional on inputs
        this.success = true;
    }

    /** @function saveQuestToHistory
     * executes after teamGoOnQuest
     * puts full Quest object into a list of Quest objects to be saved for later
     */
    saveQuestToHistory() {
        console.log("quest.js: saveQuestToHistory()");
    }

}
