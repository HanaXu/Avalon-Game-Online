<template>
  <b-modal id="setupModal" title="Setup Options" @ok="handleOk">
    <b-row>
      <b-button class="setupButton" :disabled="players.length > 9" @click="createBot">Add Bot</b-button>
    </b-row>
    <b-row>
      <b-col sm="5">
        <label class="label" for="characters">Special Characters:</label>
      </b-col>
      <b-col>
        <b-form-group>
          <b-form-checkbox
            v-for="option in options"
            v-model="selectedCharacters"
            :key="option.value"
            :value="option.value"
            :disabled="option.value === 'Morgana' && !selectedCharacters.includes('Percival')"
            @input="validateselectedCharacters()"
          >{{ option.text }}</b-form-checkbox>
        </b-form-group>
      </b-col>
    </b-row>
    <p>
      <em>
        <strong>Notes:</strong>
        <br />You cannot include Morgana unless Percival is also in the game.
        <br />5 and 6-player games cannot include more than one optional evil character.
        <br />7, 8, and 9-player games cannot include more than two optional evil characters.
      </em>
    </p>
    <!--include footer so OK and Cancel buttons dont show up-->
    <div slot="modal-footer"></div>
  </b-modal>
</template>

<script>
import { mapState } from "vuex";

export default {
  name: "SetupOptions",
  data() {
    return {
      error: false,
      errorMsg: "",
      selectedCharacters: [], // Must be an array reference!
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
    validateselectedCharacters() {
      if (
        this.selectedCharacters.includes("Morgana") &&
        !this.selectedCharacters.includes("Percival")
      ) {
        for (let i = 0; i < this.selectedCharacters.length; i++) {
          if (this.selectedCharacters[i] === "Morgana") {
            this.selectedCharacters.splice(i, 1);
          }
        }
      }
    },
    createBot() {
      this.$socket.emit("createBot");
    },
    handleOk() {
      //send selected characters to parent (Lobby.vue)
      this.$emit("clicked", this.selectedCharacters);
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