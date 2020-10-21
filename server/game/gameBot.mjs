import socketIO from 'socket.io-client';
import { Games } from '../socket/gameSocket.mjs';

const nameList = ["John", "Larry", "Barry", "Sean", "Harry", "Lisa", "Lindsey", "Jennifer", "Kathy", "Linda"];
let nameIndex = Math.floor(Math.random() * nameList.length);

// the risk score above which, Good players will always reject teams with player and not put player on quest tams
//right now, the value 10 is based on nothing
const RISK_THRESHOLD = 10;

export default class GameBot {
    constructor(roomCode, port) {
        this.socket = socketIO.connect(`http://localhost:${port}`);
        this.playerName = `${nameList[(nameIndex++) % (nameList.length)]} The Bot`;
        this.roomCode = roomCode;
        this.team = '';
        this.sanitizedPlayers = [];
        this.playerRiskScores = []; //player name, identityKnown boolean, and riskScore
    };

    //everything socket related goes here
    listen() {
        this.socket.emit("joinRoom", {
            roomCode: this.roomCode,
            playerName: this.playerName
        });

        /**
         * @param {boolean} startGame
         */
        this.socket.on('startGame', ({ startGame }) => {
            if (startGame) {
                let self = Games[this.roomCode].getPlayer('socketID', this.socket.id);
                this.team = self.team;
                this.initializePlayerRiskScores();
            }
        });

        /**
         * @param {array} Players
         */
        this.socket.on("updatePlayerCards", (players) => {
            this.sanitizedPlayers = players;
        });

        /**
         * Accept of Reject the vote for Quest Teams
         * @param {boolean} showAcceptOrRejectTeamBtns
         */
        this.socket.on("showAcceptOrRejectTeamBtns", (showAcceptOrRejectTeamBtns) => {
            if (showAcceptOrRejectTeamBtns) {
                this.socket.emit("playerAcceptsOrRejectsTeam", this.botAcceptOrRejectTeam());
            }
        });

        /**
         * @param {number} questNum
         */
        this.socket.on('updateBotRiskScores', (questNum) => {
            this.updatePlayerRiskScores(questNum);
        });

        /**
         * @param {boolean} showAddRemovePlayerBtns
         */
        this.socket.on('showAddRemovePlayerBtns', (showAddRemovePlayerBtns) => {
            if (showAddRemovePlayerBtns) {
                this.team === 'Evil' ? this.makeEvilLeaderPicks() : this.makeGoodLeaderPicks();
            }
        });

        this.socket.on('showSucceedOrFailQuestBtns', () => {
            let decision;

            if (Games[this.roomCode].currentQuestNum === 1) decision = 'succeed';
            else decision = this.team === 'Evil' ? 'fail' : 'succeed';
            this.socket.emit('questVote', decision);
        });

        /**
         * @param {boolean} showAssassinateBtn
         */
        this.socket.on('showAssassinateBtn', (showAssassinateBtn) => {
            if (showAssassinateBtn) {
                let toAssassinate = Math.floor(Math.random() * this.sanitizedPlayers.length);
                while (this.sanitizedPlayers[toAssassinate].team === 'Evil') {
                    toAssassinate = Math.floor(Math.random() * this.sanitizedPlayers.length);
                }
                this.socket.emit('assassinatePlayer', this.sanitizedPlayers[toAssassinate].name);
            }
        });
    }

    initializePlayerRiskScores() {
        this.playerRiskScores = [];
        this.sanitizedPlayers.forEach(player => {
            let risk;
            if (player.team === '???') risk = 0;
            else if (player.team === 'Evil') risk = 100;
            else if (player.team === 'Good') risk = -100;
            this.playerRiskScores.push({
                name: player.name,
                team: player.team,
                risk: risk
            })
        });
    }

    /**
     * @returns {string}
     */
    botAcceptOrRejectTeam() {
        const currentQuest = Games[this.roomCode].getCurrentQuest();
        let decision;
        if (this.team === 'Evil') {
            decision = this.makeEvilQuestTeamVote(currentQuest);
        } else if (this.team === 'Good') {
            decision = this.makeGoodQuestTeamVote(currentQuest);
        }
        return decision;
    }

    /**
     * @param {Object} currentQuest 
     * @returns {string}
     */
    makeEvilQuestTeamVote(currentQuest) {
        let evilAmount = 0;
        if (currentQuest.questNum === 1) {
            return 'accept';
        }
        else {
            Array.from(currentQuest.playersOnQuest).forEach(playerName => {
                let player = this.sanitizedPlayers.find(player => player.name === playerName);
                if (player.team === 'Evil') {
                    evilAmount++;
                }
            })
            return evilAmount > 0 ? 'accept' : 'reject';
        }
    }

    /**
     * @param {Object} currentQuest 
     * @returns {string}
     */
    makeGoodQuestTeamVote(currentQuest) {
        if (this.nextVoteTrack == 5) {
            return 'accept';
        }
        else { //determine each player's risk
            Array.from(currentQuest.playersOnQuest).forEach(playerName => {
                let player = this.sanitizedPlayers.find(player => player.name === playerName);
                if (player.team === 'Evil') {
                    return 'reject';
                }
                else if (player.team === '???') {
                    let playerRisk = this.playerRiskScores.find(player => player.name === playerName).risk;
                    if (playerRisk > RISK_THRESHOLD) {
                        return 'reject';
                    }
                }
            })
            return 'accept';
        }
    }

    makeEvilLeaderPicks() {
        const { teamSize } = Games[this.roomCode].getCurrentQuest();
        const sortedPlayerRiskScores = this.playerRiskScores.sort((a, b) => (a.risk > b.risk));

        let evilPlayer = sortedPlayerRiskScores.find(player => player.team === 'Evil');
        this.socket.emit("addRemovePlayerFromQuest", 'add', evilPlayer.name);

        for (let i = 0; i < teamSize; i++) {
            if (sortedPlayerRiskScores[i].team !== 'Evil') {
                this.socket.emit("addRemovePlayerFromQuest", 'add', sortedPlayerRiskScores[i].name);
            }
        }
        this.socket.emit('leaderHasConfirmedTeam');
    }

    makeGoodLeaderPicks() {
        const { teamSize } = Games[this.roomCode].getCurrentQuest();

        //add players with the lowest risk score
        const sortedPlayerRiskScores = this.playerRiskScores.sort((a, b) => (a.risk > b.risk));
        for (let i = 0; i < teamSize; i++) {
            this.socket.emit("addRemovePlayerFromQuest", 'add', sortedPlayerRiskScores[i].name);
        }
        this.socket.emit('leaderHasConfirmedTeam');
    }

    /**
     * @param {number} questNum 
     */
    updatePlayerRiskScores(questNum) {
        let quest = Games[this.roomCode].quests[questNum];

        this.sanitizedPlayers.forEach(player => {
            let playerRiskScore = this.playerRiskScores.find(playerRiskScore => playerRiskScore.name === player.name);
            if (quest.leader === player.name && player.team === '???') {
                quest.success ? playerRiskScore.risk-- : playerRiskScore.risk++;
            }
            //check for player on quest
            if (Array.from(quest.playersOnQuest).includes(player.name) && player.team === '???') {
                quest.success ? playerRiskScore.risk-- : playerRiskScore.risk += 10;
            }
            //check for vote accept
            if (quest.acceptOrRejectTeam.accept.includes(player.name)) {
                quest.success ? playerRiskScore.risk-- : playerRiskScore.risk += 10;
            }
            if (quest.acceptOrRejectTeam.reject.includes(player.name)) {
                quest.success ? playerRiskScore.risk += 10 : playerRiskScore.risk--;
            }
        })
    }

};