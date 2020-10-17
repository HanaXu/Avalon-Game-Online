<template>
  <b-modal id="setupModal" title="Setup Options" @hidden="handleClose">
    <b-row v-if="showAddBotBtn">
      <b-button
        class="setupButton avalon-btn-primary"
        :disabled="players.length > 9"
        @click="createBot"
        >Add Bot</b-button
      >
    </b-row>
    <b-row>
      <b-col sm="5">
        <label class="label" for="roles">Special Roles:</label>
      </b-col>
      <b-col>
        <b-form-group>
          <b-form-checkbox
            v-for="option in options"
            v-model="specialRoles"
            :key="option.value"
            :value="option.value"
            :disabled="option.value === 'Morgana' && !specialRoles.includes('Percival')"
            @input="validateSelectedRoles()"
            >{{ option.text }}</b-form-checkbox
          >
        </b-form-group>
      </b-col>
    </b-row>
    <p>
      <strong>Notes:</strong>
      <em>
        <br />You cannot include Morgana unless Percival is also in the game.
        <br />5 and 6-player games cannot include more than one optional evil
        role. <br />7, 8, and 9-player games cannot include more than two
        optional evil roles.
      </em>
    </p>
    <!--include footer so OK and Cancel buttons dont show up-->
    <div slot="modal-footer"></div>
  </b-modal>
</template>

<script>
export default {
  data() {
    return {
      showAddBotBtn: process.env.VUE_APP_DEBUG === "true",
      error: false,
      errorMsg: "",
      options: [
        {
          text: "Percival (Good, knows Merlin)",
          value: "Percival"
        },
        {
          text: "Mordred (Evil, invisible to Merlin)",
          value: "Mordred"
        },
        {
          text: "Oberon (Evil, invisible to other evil characters)",
          value: "Oberon"
        },
        {
          text: "Morgana (Evil, appears as Merlin to Percival)",
          value: "Morgana"
        }
      ]
    };
  },
  computed: {
    roomCode: {
      get() {
        return this.$store.state.roomCode;
      }
    },
    players: {
      get() {
        return this.$store.state.players;
      }
    },
    specialRoles: {
      get() {
        return this.$store.state.specialRoles;
      },
      set(specialRoles) {
        this.$store.commit('updateSpecialRoles', specialRoles);
      }
    }
  },
  methods: {
    validateSelectedRoles() {
      if (
        this.specialRoles.includes("Morgana") &&
        !this.specialRoles.includes("Percival")
      ) {
        for (let i = 0; i < this.specialRoles.length; i++) {
          if (this.specialRoles[i] === "Morgana") {
            this.specialRoles.splice(i, 1);
          }
        }
      }
    },
    createBot() {
      this.$socket.emit("createBot");
    },
    handleClose() {
      this.$socket.emit('updateSpecialRoles', this.specialRoles);
    }
  }
};
</script>

<style>
#setupModal {
  color: #000;
  text-align: left;
  padding-left: 0 !important;
}
.label {
  font-weight: bold;
}
</style>