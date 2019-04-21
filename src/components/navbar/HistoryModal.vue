<template>
  <b-modal id="modal-history" size="lg" scrollable title="Game History">
    <div
      class
      v-for="(questItem, questIndex) in questHistory"
      :key="questIndex"
      v-if="questHistory[questIndex][1].leader != null"
    >
      <h3>
        Quest #{{ questIndex }}
        <!-- put success/fail badge next to quest label -->
        <span
          class
          v-for="(voteTrackItem, voteTrackIndex) in questHistory"
          :key="voteTrackIndex"
          v-if="questHistory[questIndex][voteTrackIndex] != null"
        >
          <span v-if="questHistory[questIndex][voteTrackIndex].success != null">
            <b-badge
              class="questResult.succeed"
              v-if="questHistory[questIndex][voteTrackIndex].success"
            >Success {{questHistory[questIndex][voteTrackIndex].votes.succeed}}/{{questHistory[questIndex][voteTrackIndex].playersOnQuest.length}}</b-badge>
            <b-badge
              class="questResult.fail"
              v-if="!questHistory[questIndex][voteTrackIndex].success"
            >Fail {{questHistory[questIndex][voteTrackIndex].votes.fail}}/{{questHistory[questIndex][voteTrackIndex].playersOnQuest.length}}</b-badge>
          </span>
        </span>
      </h3>

      <div
        class
        v-for="(voteTrackItem, voteTrackIndex) in questHistory"
        :key="voteTrackIndex"
        v-if="questHistory[questIndex][voteTrackIndex] != null"
      >
        <b-row>
          <b-col cols="6" md="4">
            <strong>Leader:</strong>
            {{ questHistory[questIndex][voteTrackIndex].leader }}
          </b-col>
          <b-col cols="12" md="6">
            <strong>Proposed Team:</strong>
            <span>{{ " " + questHistory[questIndex][voteTrackIndex].playersOnQuest.join(", ") }}</span>
          </b-col>
        </b-row>

        <!-- decide quest team outcome -->
        <b-row>
          <b-col cols="3">
            <strong>Team Vote Results:</strong>
            <br>
            <b-badge
              class="voteResult teamRejected"
              v-if="questHistory[questIndex][voteTrackIndex].questTeamDecisions.result === 'rejected'"
            >Team Rejected</b-badge>
            <b-badge
              class="voteResult teamAccepted"
              v-if="questHistory[questIndex][voteTrackIndex].questTeamDecisions.result === 'accepted'"
            >Team Accepted</b-badge>
          </b-col>
          <b-col cols="9">
            <b-row>
              <b-col cols="6">
                <strong>Accepted Team:</strong>
                <br>
                <span
                  v-for="playerName in questHistory[questIndex][voteTrackIndex].questTeamDecisions.accept"
                >
                  {{ playerName }}
                  <br>
                </span>
              </b-col>
              <b-col cols="6">
                <strong>Rejected Team:</strong>
                <br>
                <span
                  v-for="playerRejectedTeam in questHistory[questIndex][voteTrackIndex].questTeamDecisions.reject"
                >
                  {{ playerRejectedTeam }}
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
      questHistory: null
    };
  },
  methods: {
    getLastVoteTrackIndex(questObj) {
      /*
      //questHistory[questIndex][voteTrackIndex].success

      for(let n = 1; n < 6; n++) {
        if(questObj.hasOwnProperty(n)) {
           console.log(`questObj ${questObj} has vote track index ${n}`);
        }
        else {
          break;
        }
      }
      n--;
      return n; */
    }
  },
  sockets: {
    updateHistoryModal(historyObj) {
      console.log(`updating History Modal`);
      this.questHistory = historyObj;
    }
  }
};
</script>
<style scoped>
h3 {
  font-family: "Segoe UI", Helvetica, Arial, sans-serif;
  text-align: center;
  border-bottom: 2px solid #8a7d6e;
  background: #eae7e3;
  padding: 2px 0;
}

.voteResult,
.voteResult.teamRejected,
.voteResult.teamAccepted {
  background: #7d67aa;
}

.questResult {
  font-size: 14px;
  padding: 8px;
  margin-bottom: 2px;
  background: #8a7d6e !important;
}

.questResult.succeed {
  color: green !important;
}

.questResult.fail {
  color: red !important;
}
</style>