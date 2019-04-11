<template>
  <b-modal id="setupModal" class="setup" @ok="handleOk">
    <!-- "ADD BOT" BUTTON WILL GO HERE IN THIS DIV -->
    <b-row style="padding-bottom: 10px">
      <b-col sm="5">
        <label class="label" for="bots">AI players:</label>
      </b-col>
      <b-col sm="3">
        <b-form-input id="bots" type="number" min="0" max="10" value="0"></b-form-input>
      </b-col>
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

        <!-- <b-form-group id="characters">
          <b-form-checkbox
            v-model="percival"
            value="true"
            unchecked-value="false"
            :disabled="hasMorgana"
            @input="togglePercival()"
          >Percival (Good, knows Merlin)</b-form-checkbox>
          <b-form-checkbox
            v-model="mordred"
            value="true"
            unchecked-value="false"
            @input="toggleMordred()"
          >Mordred (Evil, invisible to Merlin)</b-form-checkbox>
          <b-form-checkbox
            v-model="oberon"
            value="true"
            unchecked-value="false"
            @input="toggleOberon()"
          >Oberon (Evil, invisible to other Evil characters)</b-form-checkbox>
          <b-form-checkbox
            v-model="morgana"
            value="true"
            unchecked-value="false"
            :disabled="!hasPercival"
            @input="toggleMorgana()"
          >Morgana (Evil, appears as Merlin to Percival)</b-form-checkbox>
        </b-form-group>-->
      </b-col>
    </b-row>
    <div>
      Selected:
      <strong>{{ selected }}</strong>
    </div>
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
  props: [],
  data() {
    return {
      error: false,
      errorMsg: "",
      selected: [], // Must be an array reference!
      options: [
        { text: "Percival (Good, knows Merlin)", value: "Percival" },
        { text: "Mordred (Evil, invisible to Merlin)", value: "Mordred" },
        {
          text: "Oberon (Evil, invisible to other evil characters)",
          value: "Oberon"
        },
        {
          text: "Morgana (Evil, appears as Merlin to Percival)",
          value: "Morgana"
        }
      ]
      // percivalSelected: false
      // hasMordred: false,
      // hasOberon: false,
      // hasMorgana: false,
      // selected: [],
      // percival: false,
      // mordred: false,
      // oberon: false,
      // morgana: false
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
      console.log(this.selected);
    },
    // togglePercival() {
    //   //I have no clue why I need these toggle functions and cant just reference the value of each v-model yet here we are
    //   this.hasPercival = !this.hasPercival;
    // },
    // toggleMordred() {
    //   this.hasMordred = !this.hasMordred;
    // },
    // toggleOberon() {
    //   this.hasOberon = !this.hasOberon;
    // },
    // toggleMorgana() {
    //   this.hasMorgana = !this.hasMorgana;
    // },
    handleOk() {
      let selectedArray = [];
      if (this.hasPercival) {
        console.log("percival true");
        selectedArray.push("percival");
      }
      if (this.hasMordred) {
        console.log("mordred true");
        selectedArray.push("mordred");
      }
      if (this.hasOberon) {
        console.log("oberon true");
        selectedArray.push("oberon");
      }
      if (this.hasMorgana) {
        console.log("morgana true");
        selectedArray.push("morgana");
      }
      console.log(selectedArray);
      //send array of selected characters to parent (Game.vue)
      this.$emit("clicked", selectedArray);
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