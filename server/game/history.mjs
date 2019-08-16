export default class QuestHistory {

    constructor(questNum) {
        this.questNum = questNum;
        this.playersOnQuest = null;
        this.voteTrack = 1;
        this.leader = null;
        this.questTeamDecisions = {
            'result': null,
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