<template>
  <b-row v-if="showConfirmTeamBtnToLeader || showAcceptRejectButtons" class="section">
    <b-col class="sectionTitle" cols="3" md="2">Action</b-col>
    <b-col class="py-0">
      <div v-if="showConfirmTeamBtnToLeader">
        <b-button
          class="avalon-btn-lg"
          id="confirm-team-btn"
          @click="leaderHasConfirmedTeam"
        >Confirm Team</b-button>
      </div>
      <div v-if="showAcceptRejectButtons">
        <b-button
          class="avalon-btn-lg"
          id="accept-team-btn"
          @click="playerAcceptsOrRejectsTeam('accept')"
        >Accept Team</b-button>
        <b-button
          class="avalon-btn-lg"
          id="reject-team-btn"
          @click="playerAcceptsOrRejectsTeam('reject')"
        >Reject Team</b-button>
      </div>
    </b-col>
  </b-row>
</template>

<script>
import { mapState } from "vuex";

export default {
  name: "DecideQuestTeam",
  data() {
    return {
      showConfirmTeamBtnToLeader: false,
      showAcceptRejectButtons: false,
      showHasVoted: false,
      showTeamVoteResults: false
    };
  },
  computed: mapState(["name"]),
  methods: {
    leaderHasConfirmedTeam() {
      this.$socket.emit("leaderHasConfirmedTeam");
    },
    playerAcceptsOrRejectsTeam(decision) {
      this.$socket.emit("playerAcceptsOrRejectsTeam", {
        name: this.name,
        decision: decision
      });
    }
  },
  sockets: {
    showConfirmTeamBtnToLeader(bool) {
      this.showConfirmTeamBtnToLeader = bool;
    },
    showAcceptOrRejectTeamBtns(bool) {
      this.showAcceptRejectButtons = bool;
    }
  }
};
</script>

