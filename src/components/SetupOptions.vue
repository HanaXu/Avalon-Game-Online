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
    <b-form-group id="characters">
       <!-- <b-form-checkbox-group v-model="selected" name="optionalCharacters" stacked> -->
          <b-form-checkbox v-model="percival" value="true" unchecked-value="false" :disabled="hasMorgana" @input="togglePercival()">Percival (Good, knows Merlin)</b-form-checkbox>
          <b-form-checkbox v-model="mordred" value="true" unchecked-value="false">Mordred (Evil, invisible to Merlin)</b-form-checkbox>
          <b-form-checkbox v-model="oberon" value="true" unchecked-value="false">Oberon (Evil, invisible to other Evil characters)</b-form-checkbox>
          <b-form-checkbox v-model="morgana" value="true" unchecked-value="false" :disabled="!hasPercival" @input="toggleMorgana()">Morgana (Evil, appears as Merlin to Percival)</b-form-checkbox>
     <!--   </b-form-checkbox-group> -->
    </b-form-group>
    </b-col>
    </b-row>


    <p><em><strong>Notes:</strong><br>You cannot include Morgana unless Percival is also in the game.<br>5 and 6-player games cannot include more than one optional evil character.<br>7, 8, and 9-player games cannot include more than two optional evil characters.</em></p>

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
      hasPercival: false,
      hasMorgana: false,
      selected: [],
      percival: false,
      mordred: false,
      oberon: false,
      morgana: false
    }
  },
  methods: {
    togglePercival() {
      this.hasPercival = !this.hasPercival;
      console.log(this.hasPercival);
    },
    toggleMorgana() {
      this.hasMorgana = !this.hasMorgana;
      console.log(this.hasMorgana);
    },
    handleOk() {
      var selectedArray = [];
      if (this.percival) {
        selectedArray.push("percival");
      }
      if (this.mordred) {
        selectedArray.push("mordred");
      }
      if (this.oberon) {
        selectedArray.push("oberon");
      }
      if (this.morgana) {
        selectedArray.push("morgana");
      }
      console.log(selectedArray);
      //send array of selected characters to parent (Game.vue)
      this.$emit('clicked', selectedArray);
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