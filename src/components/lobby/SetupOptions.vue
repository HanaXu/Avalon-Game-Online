<template>
  <b-modal id="setupModal" title="Setup Options" @hidden="handleClose">
    <b-row v-if="showAddBotBtn">
      <b-button class="setupButton avalon-btn-primary" :disabled="players.length > 9" @click="createBot">Add Bot</b-button>
    </b-row>
    <b-row>
      <b-col sm="5">
        <label class="label" for="roles">Special Roles:</label>
      </b-col>
      <b-col>
        <b-form-group>
          <b-form-checkbox
            v-for="option in options"
            v-model="selectedRoles"
            :key="option.value"
            :value="option.value"
            :disabled="option.value === 'Morgana' && !selectedRoles.includes('Percival')"
            @input="validateSelectedRoles()"
          >{{ option.text }}</b-form-checkbox>
        </b-form-group>
      </b-col>
    </b-row>
    <p>
      <strong>Notes:</strong>
      <em>
        <br />You cannot include Morgana unless Percival is also in the game.
        <br />5 and 6-player games cannot include more than one optional evil role.
        <br />7, 8, and 9-player games cannot include more than two optional evil roles.
      </em>
    </p>
    <!--include footer so OK and Cancel buttons dont show up-->
    <div slot="modal-footer"></div>
  </b-modal>
</template>

<script>
import { mapState } from "vuex";

export default {
  data() {
    return {
      showAddBotBtn: process.env.VUE_APP_DEBUG === 'true',
      error: false,
      errorMsg: "",
      selectedRoles: [], // Must be an array reference!
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
  computed: mapState(["roomCode", "players"]),
  methods: {
    validateSelectedRoles() {
      if (
        this.selectedRoles.includes("Morgana") &&
        !this.selectedRoles.includes("Percival")
      ) {
        for (let i = 0; i < this.selectedRoles.length; i++) {
          if (this.selectedRoles[i] === "Morgana") {
            this.selectedRoles.splice(i, 1);
          }
        }
      }
    },
    createBot() {
      this.$socket.emit("createBot");
    },
    handleClose() {
      //send selected roles to parent (Lobby.vue)
      this.$emit("selectedRoles", this.selectedRoles);
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