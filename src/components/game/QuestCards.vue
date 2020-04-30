<template>
  <div class="row justify-content-md-center mb-1">
    <div
      class="quest"
      :class="{'d-flex flex-nowrap': width < 768, 'd-flex flex-wrap': width >= 768}"
    >
      <div
        class="card"
        v-for="(quest, index) in quests"
        :key="index"
        :class="{
          fail: quest.success === false,
          success: quest.success === true,
          self: quest.currentQuest === true}"
      >
        <div class="card-body">
          <h5 class="card-title">
            Quest {{ quest.questNum }}
            <span
              v-if="quest.currentQuest === true"
              style="color: #FFD700"
            >👑</span>
          </h5>
          <h6 class="card-subtitle mb-2 text-muted">{{ quest.teamSize }} players</h6>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "QuestCards",
  data() {
    return {
      quests: [],
      width: window.innerWidth
    };
  },
  sockets: {
    updateQuestCards(quests) {
      this.quests = quests;
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
    border: 5px solid #a42323 !important;
  }
  .success {
    border: 5px solid green !important;
  }
}

/****MOBILE SCREENS****/
@media screen and (max-width: 425px) {
  .quest {
    .card {
      width: 64px;
    }
  }
}
</style>
