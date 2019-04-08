<template>
  <ul style="list-style-type: none;">
    <li
      style="font-size: 27px;"
      v-for="(player, index) in players"
      :key="index"
    >{{ player.role }}: {{ player.name }}</li>
  </ul>
</template>

<script>
export default {
  name: "LobbyList",
  props: ["players"]
};
</script>

<style scoped>
ul {
  padding: 0;
  padding-top: 1rem;
}
li {
  padding-left: 1.5rem;
}
</style>