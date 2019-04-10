<template>
  <div class="row justify-content-md-center" style="padding: 1rem;">
    <div class="card" v-for="(quest, index) in quests" :key="index">
      <div class="card-body">
        <h5 class="card-title">
          Quest {{ quest.questNum }}
          <span style="color: #FFD700" v-if="quest.currentQuest === true">👑</span>
        </h5>
        <h6 class="card-subtitle mb-2 text-muted">{{ quest.teamSize }} players</h6>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "QuestCards",
  props: ["quests"]
};
</script>

<style scoped>
.card {
  width: 9rem !important;
  border-radius: 1rem !important;
}
.card-body {
  padding: 0.5rem 0rem;
}
</style>
