<template>
  <b-row
    v-if="
      showConfirmTeamBtnToLeader ||
      showAcceptRejectButtons ||
      showQuestVoteBtns ||
      showStartGameBtn ||
      showLobbyBtn
    "
    class="status-section"
  >
    <b-col class="section-title" md="2">Action</b-col>
    <b-col class="py-0">
      <div v-if="showStartGameBtn">
        <b-button
          class="avalon-btn-primary big"
          id="start-game-btn"
          @click="startGame"
          >Start Game</b-button
        >
      </div>
      <div v-if="showConfirmTeamBtnToLeader">
        <b-button
          class="avalon-btn-primary big"
          id="confirm-team-btn"
          @click="leaderHasConfirmedTeam"
          >Confirm Team</b-button
        >
      </div>
      <div v-if="showAcceptRejectButtons">
        <b-button
          class="avalon-btn-primary big"
          id="accept-team-btn"
          @click="playerAcceptsOrRejectsTeam('accept')"
          >Accept Team</b-button
        >
        <b-button
          class="avalon-btn-primary big"
          id="reject-team-btn"
          @click="playerAcceptsOrRejectsTeam('reject')"
          >Reject Team</b-button
        >
      </div>
      <div v-if="showQuestVoteBtns">
        <b-button
          class="avalon-btn-primary big"
          id="succeed-btn"
          @click="questVote('succeed')"
          >Succeed Quest</b-button
        >
        <b-button
          v-if="!disableFailBtn"
          class="avalon-btn-primary big"
          id="fail-btn"
          @click="questVote('fail')"
          >Fail Quest</b-button
        >
      </div>
      <div v-if="showLobbyBtn">
        <b-button
          class="avalon-btn-primary big"
          id="lobby-btn"
          @click="goToLobby"
          >Go To Lobby</b-button
        >
      </div>
    </b-col>
  </b-row>
</template>

<script>
import { mapState } from "vuex";

export default {
  data() {
    return {
      showStartGameBtn: false,
      showConfirmTeamBtnToLeader: false,
      showAcceptRejectButtons: false,
      showTeamVoteResults: false,
      showQuestVoteBtns: false,
      disableFailBtn: false,
      showLobbyBtn: false
    };
  },
  computed: mapState(["playerName"]),
  methods: {
    startGame() {
      this.$socket.client.emit("startGame");
    },
    leaderHasConfirmedTeam() {
      this.$socket.client.emit("leaderHasConfirmedTeam");
    },
    playerAcceptsOrRejectsTeam(decision) {
      this.$socket.client.emit("playerAcceptsOrRejectsTeam", decision);
    },
    questVote(decision) {
      this.showQuestVoteBtns = false;
      this.$socket.client.emit("questVote", decision);
    },
    goToLobby() {
      this.$socket.client.emit("resetGame");
    }
  },
  sockets: {
    showStartGameBtn(showStartGameBtn) {
      this.showStartGameBtn = showStartGameBtn;
    },
    showConfirmTeamBtnToLeader(bool) {
      this.showConfirmTeamBtnToLeader = bool;
    },
    showAcceptOrRejectTeamBtns(bool) {
      this.showAcceptRejectButtons = bool;
    },
    showSucceedOrFailQuestBtns(disableFailBtn) {
      this.showQuestVoteBtns = true;
      this.disableFailBtn = disableFailBtn;
    },
    showLobbyBtn(showLobbyBtn) {
      this.showLobbyBtn = showLobbyBtn;
    }
  }
};
</script>

