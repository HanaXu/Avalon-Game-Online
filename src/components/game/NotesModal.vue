<template>
  <b-modal
    :id="'notes-modal-' + playerName"
    :title="playerName"
    @shown="focusMyElement"
    @hidden="saveNotes"
  >
    <!-- Element to gain focus when modal is opened -->
    <b-form-textarea
      ref="focusThis"
      id="textarea"
      v-model="notes"
      placeholder="Notes..."
      rows="6"
      max-rows="6"
    ></b-form-textarea>
    <!--include footer so OK and Cancel buttons dont show up-->
    <div slot="modal-footer"></div>
  </b-modal>
</template>

<script>
import { mapState } from "vuex";

export default {
  props: ["playerName"],
  computed: mapState(["roomCode"]),
  data() {
    return {
      notes: "",
      key: ""
    };
  },
  mounted() {
    this.key = `${this.roomCode}-${this.playerName}`;
    this.notes = sessionStorage.getItem(this.key);
  },
  methods: {
    focusMyElement(e) {
      this.$refs.focusThis.focus();
    },
    saveNotes() {
      if (this.notes !== sessionStorage.getItem(this.key)) {
        sessionStorage.setItem(this.key, this.notes);
      }
    }
  }
};
</script>