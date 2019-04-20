<template>
  <b-modal id="setupModal" class="setup" @ok="handleOk">
    <!-- "ADD BOT" BUTTON WILL GO HERE IN THIS DIV -->
<!--    <b-row style="padding-bottom: 10px">
      <b-col sm="5">
        <label class="label" for="bots">AI players:</label>
      </b-col>
      <b-col sm="3">
        <b-form-input id="bots" type="number" min="0" max="10" value="0"></b-form-input>
      </b-col>
    </b-row>
  -->
    <b-row>
      <b-button margin-top="20px" class="setupButton" @click="createBot">Add Bot</b-button>
    </b-row>
    <b-row>
      <b-col sm="5">
        <label class="label" for="characters">Special Characters:</label>
      </b-col>
      <b-col>
        <b-form-group>
          <b-form-checkbox
            v-for="option in options"
            v-model="selected"
            :key="option.value"
            :value="option.value"
            :disabled="option.value === 'Morgana' && !selected.includes('Percival')"
            @input="validateSelected()"
          >{{ option.text }}</b-form-checkbox>
        </b-form-group>
      </b-col>
    </b-row>

<!-- <div> Selected: <strong>{{ selected }}</strong> </div> -->

    <p>
      <em>
        <strong>Notes:</strong>
        <br>You cannot include Morgana unless Percival is also in the game.
        <br>5 and 6-player games cannot include more than one optional evil character.
        <br>7, 8, and 9-player games cannot include more than two optional evil characters.
      </em>
    </p>
  </b-modal>
</template>

<script>
export default {
  name: "SetupOptions",
  props: [
    "roomCode"
  ],
  data() {
    return {
      error: false,
      errorMsg: "",
      selected: [], // Must be an array reference!
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
  methods: {
    validateSelected() {
      if (
        this.selected.includes("Morgana") &&
        !this.selected.includes("Percival")
      ) {
        for (let i = 0; i < this.selected.length; i++) {
          if (this.selected[i] === 'Morgana') {
            this.selected.splice(i, 1);
          }
        }
      }
    },
    createBot(){
      console.log(`CreateBot function Called with room: ${this.roomCode}`);
      this.$socket.emit("createBot", this.roomCode);
    },
    handleOk() {
      //send array of selected characters to parent (Game.vue)
      this.$emit("clicked", this.selected);
    }
  }
};
</script>

<style>
.setup {
  color: #000;
  text-align: left;
}

.label {
  font-weight: bold;
}
</style>