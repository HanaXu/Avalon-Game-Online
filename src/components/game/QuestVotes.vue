<template>
  <b-row v-if="canVoteOnQuest" class="status-section">
    <b-col class="section-title" md="2">Action</b-col>
    <b-col class="py-0">
      <b-button
        class="avalon-btn-primary big"
        id="succeed-btn"
        @click="questVote('succeed')"
      >Succeed Quest</b-button>
      <b-button
        v-if="!disableFailBtn"
        class="avalon-btn-primary big"
        id="fail-btn"
        @click="questVote('fail')"
      >Fail Quest</b-button>
    </b-col>
  </b-row>
</template>

<script>
import { mapState } from "vuex";

export default {
  name: "QuestVotes",
  data() {
    return {
      canVoteOnQuest: false,
      disableFailBtn: false
    };
  },
  computed: mapState(["name"]),
  methods: {
    questVote(decision) {
      this.canVoteOnQuest = false;
      this.$socket.emit("questVote", {
        name: this.name,
        decision: decision
      });
    }
  },
  sockets: {
    succeedOrFailQuest(disableFailBtn) {
      this.canVoteOnQuest = true;
      this.disableFailBtn = disableFailBtn;
    }
  }
};
</script>