<template>
  <b-row v-if="canVoteOnQuest" class="section">
    <b-col class="sectionTitle" md="2">Action</b-col>
    <b-col class="py-0">
      <b-button class="avalon-btn" id="succeed-btn" @click="questVote('succeed')">Succeed</b-button>
      <b-button
        class="avalon-btn"
        id="fail-btn"
        @click="questVote('fail')"
        :disabled="disableFailBtn"
      >Fail</b-button>
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