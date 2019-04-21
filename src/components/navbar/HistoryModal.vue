<template>
  <b-modal id="modal-history" size="lg" scrollable title="Game History">
    <div class=""
      v-for="(questItem, questIndex) in questHistory"
      :key="questIndex"
      v-if="questHistory[questIndex][1].leader != null"
    >
      <h3>
        Quest #{{ questIndex }}

        <!-- put success/fail badge next to quest label -->

        <span class=""
          v-for="(voteTrackItem, voteTrackIndex) in questHistory"
          :key="voteTrackIndex"
          v-if="questHistory[questIndex][voteTrackIndex].success != null"
        >
          <b-badge class="questResult success" v-if="questHistory[questIndex][voteTrackIndex].success">
              Quest Success
          </b-badge>
          <b-badge class="questResult fail" v-if="!questHistory[questIndex][voteTrackIndex].success">
              Quest Fail
          </b-badge>
          </span>
        </b-badge>


      </h3>
      <div class=""
        v-for="(voteTrackItem, voteTrackIndex) in questHistory"
        :key="voteTrackIndex"
        v-if="questHistory[questIndex][voteTrackIndex] != null"
      >
        <b-row>
          <b-col cols="6" md="2">

            <strong>Leader:</strong> {{ questHistory[questIndex][voteTrackIndex].leader }}
           </b-col>
           <b-col cols="12" md="6">
            <strong>Proposed Team:</strong>
                <span v-for="playerName in questHistory[questIndex][voteTrackIndex].playersOnQuest">
                    {{ playerName }}
                </span>
            </b-col>
        </b-row>
        <!-- decide quest team outcome -->
        <b-row>
          <b-col cols="3">
            <strong>Team Vote Results:</strong>
          </b-col>
          <b-col cols="9">
              <span v-for="playerName in questHistory[questIndex][voteTrackIndex].questTeamDecisions.accept">
                  {{ playerName }} - Accepted<br>
              </span>
              <span v-for="playerRejectedTeam in questHistory[questIndex][voteTrackIndex].questTeamDecisions.reject">
                  {{ playerRejectedTeam }} - Rejected<br>
              </span>
          </b-col>
        </b-row>

        <b-row class="justify-content-md-center">
            <b-badge class="voteResult teamRejected" v-if="questHistory[questIndex][voteTrackIndex].questTeamDecisions.reject.length > questHistory[questIndex][voteTrackIndex].questTeamDecisions.accept.length">
                Team Rejected
            </b-badge>
            <b-badge class="voteResult teamAccepted" v-if="questHistory[questIndex][voteTrackIndex].questTeamDecisions.reject.length <= questHistory[questIndex][voteTrackIndex].questTeamDecisions.accept.length">
                Team Accepted
            </b-badge>
        </b-row>


        <!-- quest team succeed/fail outcome-->
       <span v-if="questHistory[questIndex][voteTrackIndex].success != null">
            <b-row>
              <b-col cols="3">
                <strong>Quest Results: </strong>
              </b-col>
              <b-col cols="9">
                <span v-for="n in questHistory[questIndex][voteTrackIndex].votes.succeed">Success </span>
                <span v-for="n in questHistory[questIndex][voteTrackIndex].votes.fail">Fail </span>
              </b-col>
            </b-row>
            <b-row class="justify-content-md-center">
                <b-badge class="voteResult" v-if="questHistory[questIndex][voteTrackIndex].success">
                    Quest Success
                </b-badge>
                <b-badge class="voteResult" v-if="!questHistory[questIndex][voteTrackIndex].success">
                    Quest Fail
                </b-badge>
            </b-row>


        </span>






      </div>
    </div>
  </b-modal>
</template>
<script>
export default {
  name: "HistoryModal",
  data() {
    return {
        questHistory: null,
    }
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
     updateHistoryModal(data) {
        console.log(`updating History Modal with: ${data}`);
        this.questHistory = data.historyObj;
     }
  }
}
</script>
<style scoped>
h3 {
  font-family: "Segoe UI", Helvetica, Arial, sans-serif;
  text-align: center;
  border-bottom: 2px solid #8A7D6E;
}

.voteResult,
.voteResult.teamRejected,
.voteResult.teamAccepted {
    background: #7D67AA;
}

.questResult {
  font-size: 14px;
  padding: 8px;
  margin-bottom: 2px;
}

.questResult.success {
   background-color: green;
}

.questResult.fail {
   background-color: red;
}

</style>