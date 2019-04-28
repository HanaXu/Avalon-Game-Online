<template>
  <b-modal id="modal-history" size="lg" scrollable title="Game History">
    <h4 v-if="challengeMode === 'ON'">Challenge mode is on. No history is saved.</h4>
    <div
      class
      v-for="(questItem, questIndex) in questHistory"
      :key="questIndex"
      v-if="questItem[1].leader != null"
    >
      <h3>
        Quest #{{ questIndex }}
        <!-- put success/fail badge next to quest label -->
        <span
          class
          v-for="(voteTrackItem, voteTrackIndex) in questHistory"
          :key="voteTrackIndex"
          v-if="questItem[voteTrackIndex] != null"
        >
          <span v-if="questItem[voteTrackIndex].success != null">
            <b-badge
              class="questResult succeed"
              v-if="questItem[voteTrackIndex].success"
            >Success {{questItem[voteTrackIndex].votes.succeed}}/{{questItem[voteTrackIndex].playersOnQuest.length}}</b-badge>
            <b-badge
              class="questResult fail"
              v-if="!questItem[voteTrackIndex].success"
            >Fail {{questItem[voteTrackIndex].votes.fail}}/{{questItem[voteTrackIndex].playersOnQuest.length}}</b-badge>
          </span>
        </span>
      </h3>

      <div
        class="voteTrackItem"
        v-for="(voteTrackItem, voteTrackIndex) in questHistory"
        :key="voteTrackIndex"
        v-if="questItem[voteTrackIndex] != null"
      >
        <b-row>
          <b-col cols="12" md="6">
            <strong>Leader:</strong>
            {{ questItem[voteTrackIndex].leader }}
          </b-col>
          <b-col cols="12" md="6">
            <strong>Proposed Team:</strong>
            <span>{{ " " + questItem[voteTrackIndex].playersOnQuest.join(", ") }}</span>
          </b-col>
        </b-row>

        <!-- decide quest team outcome -->
        <b-row>
          <b-col cols="12" md="3">
            <strong>Team Vote Results:</strong>

            <b-badge
              class="voteResult teamRejected"
              v-if="questItem[voteTrackIndex].questTeamDecisions.result === 'rejected'"
            >Rejected Team</b-badge>
            <b-badge
              class="voteResult teamAccepted"
              v-if="questItem[voteTrackIndex].questTeamDecisions.result === 'accepted'"
            >Accepted Team</b-badge>
          </b-col>
          <b-col cols="12" md="9">
            <b-row>
              <b-col cols="6">
                <span class="subheader">Accepted Team</span>
                <br>

                <span
                  v-for="(playerName, index) in questItem[voteTrackIndex].questTeamDecisions.accept"
                  :key="index"
                >
                  {{ playerName }}
                  <br>
                </span>
              </b-col>
              <b-col cols="6">
                <span class="subheader">Rejected Team</span>
                <br>
                <span
                  v-for="(playerName, index) in questItem[voteTrackIndex].questTeamDecisions.reject"
                  :key="index"
                >
                  {{ playerName }}
                  <br>
                </span>
              </b-col>
            </b-row>
          </b-col>
        </b-row>
      </div>
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
      challengeMode: "OFF"
    };
  },
  sockets: {
    updateHistoryModal(historyObj) {
      console.log(`updating History Modal`);
      this.questHistory = historyObj;
    },
    updateChallengeMode(str) {
      this.challengeMode = str;
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

.voteTrackItem {
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
  /* text-decoration: underline; */
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