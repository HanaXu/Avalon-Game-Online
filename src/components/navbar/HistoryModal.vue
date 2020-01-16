<template>
  <b-modal id="modal-history" size="lg" scrollable title="Game History">
    <h4 v-if="challengeMode">Challenge mode is on. No history is saved.</h4>
    <div v-for="(quest, questIndex) in questHistory" :key="questIndex">
      <!-- put success/fail badge next to quest label -->
      <span v-for="(voteTrack, voteTrackIndex) in quest" :key="voteTrackIndex">
        <h3>Quest #{{ questIndex }}
        <span>
          <b-badge class="questResult succeed" v-if="voteTrack.success && voteTrack.votes.succeed > 0">
            Success {{voteTrack.votes.succeed}}/{{voteTrack.playersOnQuest.length}}
          </b-badge>
          <b-badge class="questResult fail" v-if="!voteTrack.success && voteTrack.votes.fail > 0">
            Fail {{voteTrack.votes.fail}}/{{voteTrack.playersOnQuest.length}}
          </b-badge>
        </span>
        </h3>
        <b-row>
          <b-col cols="12" md="4">
            <strong>Leader:</strong> {{quest[voteTrackIndex].leader}}
          </b-col>
          <b-col cols="12" md="8">
            <strong>Proposed Team:</strong><span>{{ " " + quest[voteTrackIndex].playersOnQuest.join(", ")}}</span>
          </b-col>
        </b-row>
        <!-- decide quest team outcome -->
        <b-row>
          <b-col cols="12" md="3">
            <strong>Team Vote Results:</strong>
            <b-badge class="voteResult teamRejected" v-if="quest[voteTrackIndex].acceptOrRejectTeam.result === 'rejected'">
              Rejected Team
            </b-badge>
            <b-badge class="voteResult teamAccepted" v-if="quest[voteTrackIndex].acceptOrRejectTeam.result === 'accepted'">
              Accepted Team
            </b-badge>
          </b-col>
          <b-col cols="12" md="9">
            <b-row>
              <b-col cols="6">
                <span class="subheader">Accepted Team</span><br>
                <span
                  v-for="(playerName, index) in quest[voteTrackIndex].acceptOrRejectTeam.accept" :key="index">
                  {{ playerName }}<br>
                </span>
              </b-col>
              <b-col cols="6">
                <span class="subheader">Rejected Team</span><br>
                <span
                  v-for="(playerName, index) in quest[voteTrackIndex].acceptOrRejectTeam.reject" :key="index">
                  {{ playerName }}<br>
                </span>
              </b-col>
            </b-row>
          </b-col>
        </b-row>
      </span>
    </div>
    <!--include footer so OK and Cancel buttons dont show up-->
    <div slot="modal-footer"></div>
  </b-modal>
</template>

<script>
export default {
  name: "HistoryModal",
  data() {
    return {
      questHistory: null,
      challengeMode: false
    };
  },
  sockets: {
    updateHistoryModal(historyObj) {
      this.questHistory = historyObj;
    },
    updateChallengeMode(challengeMode) {
      this.challengeMode = challengeMode;
    }
  }
};
</script>

<style scoped>
#modal-history {
  overflow-x: hidden;
  word-wrap: break-word;
}
h3 {
  font-family: "Segoe UI", Helvetica, Arial, sans-serif;
  text-align: center;
  background: #eae7e3;
  padding: 2px 0;
  margin: 0;
}
.col-6 {
  overflow: hidden;
  text-overflow: ellipsis;
}
.voteTrack {
  border-top: 2px solid #8a7d6e;
}
.voteResult,
.voteResult.teamAccepted {
  background: #7d67aa;
}
.voteResult.teamRejected {
  background: #a42323;
}
.subheader {
  font-weight: bold;
  border-bottom: 2px solid #8a7d6e;
}
.questResult {
  background: #c7c2cf;
}
.questResult.succeed {
  color: green !important;
}
.questResult.fail {
  color: #a42323 !important;
}
</style>