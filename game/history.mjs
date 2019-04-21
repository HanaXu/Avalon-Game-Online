export class QuestHistory {

    constructor(questNum) {
        this.questNum = questNum;
        this.playersOnQuest = null;
        this.voteTrack = 1;
        this.leader = null;
        this.questTeamDecisions = {
            'accept': [],
            'reject': []
        };
        this.votes = {
            'succeed': null,
            'fail': null
        };
        this.success = null;
    }
}