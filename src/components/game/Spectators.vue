<template>
  <b-alert :show="spectators.length > 0" variant="dark" class="spectators">
    Spectators:
    <span v-for="(spectator, index) in spectators" :key="index">
      <span :class="{self: spectator.name === playerName}">{{spectator.name}}</span>,
    </span>
  </b-alert>
</template>

<script>
import { mapState } from "vuex";

export default {
  data() {
    return {
      spectators: []
    };
  },
  computed: mapState(["playerName"]),
  sockets: {
    updateSpectatorsList(spectators) {
      this.spectators = spectators;
    }
  }
};
</script>