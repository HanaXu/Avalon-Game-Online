<template>
  <div>
    <div class="row justify-content-md-center mb-3 questCards">
      <div
        class
        v-bind:class="{'d-flex flex-nowrap': width < 768, 'd-flex flex-wrap': width >= 768}"
      >
        <div
          class="quest card"
          v-for="(quest, index) in quests"
          :key="index"
          :class="{markRed: quest.success === false, markGreen: quest.success === true, darkerBG: quest.currentQuest === true}"
        >
          <div class="quest card-body">
            <h5 class="quest card-title">
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

<style scoped>
/*
.card {
  width: 9rem !important;
  border-radius: 1rem !important;
}
.card-body {
  padding: 0rem;
}
.markRed {
  border: 5px solid red !important;
}
.markGreen {
  border: 5px solid green !important;
}
*/
</style>
