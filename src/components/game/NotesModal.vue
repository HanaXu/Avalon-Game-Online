<template>
  <b-modal :id="'notes-modal-' + playerName" :title="playerName" @shown="focusMyElement">
    <!-- Element to gain focus when modal is opened -->
    <b-form-textarea
      ref="focusThis"
      id="textarea"
      v-model="text"
      placeholder="Notes..."
      rows="6"
      max-rows="6"
    ></b-form-textarea>
    <!--include footer so OK and Cancel buttons dont show up-->
    <div slot="modal-footer"></div>
  </b-modal>
</template>

<script>
export default {
  name: "NotesModal",
  props: ["playerName"],
  data() {
    return {
      text: ""
    };
  },
  methods: {
    focusMyElement(e) {
      this.$refs.focusThis.focus();
    }
  }
};
</script>