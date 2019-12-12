<template>
  <b-row class="section" v-if="canVoteOnQuest">
    <b-col class="sectionTitle" cols="3" md="2">Action</b-col>
    <b-col class="py-0">
      <b-button class="avalon-btn-lg" id="succeed-btn" @click="questVote('succeed')">Succeed</b-button>
      <b-button
        class="avalon-btn-lg"
        id="fail-btn"
        @click="questVote('fail')"
        :disabled="disableFailBtn"
      >Fail</b-button>
    </b-col>
  </b-row>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: "QuestVotes",
  data() {
    return {
      canVoteOnQuest: false,
      disableFailBtn: false
    };
  },
  computed: mapState(['name']),
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
    goOnQuest(bool) {
      this.canVoteOnQuest = true;
      this.disableFailBtn = bool;
    }
  }
};
</script>