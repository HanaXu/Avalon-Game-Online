<template>
  <div class="row" style="padding: 1rem;">
    <div
      class="card"
      :class="{darkerBG: player.name.includes(' (You)')}"
      v-for="(player, index) in players"
      :key="index"
    >
      <div
        class="card-body"
        :class="{markRed: player.team === 'Evil', markGreen: player.team === 'Good'}"
      >
        <h5 class="card-title">
          {{ player.role }}: {{ player.name }}
          <span
            style="color: #FFD700"
            v-if="player.leader === true"
          >👑</span>
        </h5>
        <h6 class="card-subtitle mb-2 text-muted">
          <b>Team:</b>
          {{ player.team }}
          <br>
          <b>Character:</b>
          {{ player.character }}
          <br>
        </h6>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "PlayerCards",
  props: ["players"]
};
</script>

<style>
.markRed {
  border-top: 5px solid red;
}
.markGreen {
  border-top: 5px solid green;
}
.card-body {
  padding: 0.5rem 1rem;
}
.card {
  background: #f8f9fa; /* bootstrap 4 bg-light*/
  margin: 5px;
  width: 12rem;
}
.darkerBG {
  background: lightsteelblue;
}
.card .card-body {
  margin: 5px;
}
</style>
