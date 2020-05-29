<template>
  <div class="quest row justify-content-center">
    <div
      v-for="(quest, index) in quests"
      class="card"
      :key="index"
      :class="{
          fail: quest.success === false,
          success: quest.success === true,
          self: quest.currentQuest === true}"
    >
      <div class="card-body">
        <h5 class="card-title">Quest {{ quest.questNum }}</h5>
        <h6 class="card-subtitle mb-2 text-muted">{{ quest.teamSize }} players</h6>
        <h6 v-if="quest.needsTwoFails" class="card-subtitle mb-2 text-muted font-italic">2 fails</h6>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      quests: [],
      width: window.innerWidth
    };
  },
  sockets: {
    initQuests(quests) {
      this.quests = quests;
    },
    updateQuest(data) {
      this.quests[data.questNum] = Object.assign(this.quests[data.questNum], data);
    }
  }
};
</script>

<style lang="scss">
.quest {
  .card {
    border-radius: 5px;
    background: #f8f9fa; /* bootstrap 4 bg-light*/
    margin: 4px;
    width: 100px;
    border: none;
    padding: 1px !important;
    box-shadow: 1px 2px 5px #c2ab8e;
  }
  .card-body {
    padding: 2px;
  }
  .fail {
    border: 3px solid #a42323 !important;
  }
  .success {
    border: 3px solid #3c48bb !important;
  }
}

@media screen and (max-width: 425px) {
  .quest {
    .card {
      width: 64px;
    }
  }
}
</style>
