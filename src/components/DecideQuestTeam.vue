<template>
  <b-row class="section" v-if="showConfirmTeamBtnToLeader || showAcceptRejectButtons">
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
  props: ["yourName"],
  methods: {
    leaderHasConfirmedTeam() {
      this.$socket.emit("leaderHasConfirmedTeam");
    },
    playerAcceptsOrRejectsTeam(decision) {
      this.$socket.emit("playerAcceptsOrRejectsTeam", {
        name: this.yourName,
        decision: decision
      });
    }
  },
  sockets: {
    showConfirmTeamBtnToLeader(bool) {
      this.showConfirmTeamBtnToLeader = bool;
    },
    showAcceptOrRejectTeamBtns(data) {
      this.showAcceptRejectButtons = data.bool;
    }
  }
};
</script>

