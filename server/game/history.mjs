export default class QuestHistory {
    constructor(quest) {
        this.questNum = quest.questNum;
        this.playersOnQuest = Array.from(quest.playersOnQuest);
        this.voteTrack = quest.voteTrack;
        this.leader = quest.leaderInfo.name;
        this.acceptOrRejectTeam = {...quest.acceptOrRejectTeam};
        this.votes = {...quest.votes};
        this.success = quest.success;
    }
}