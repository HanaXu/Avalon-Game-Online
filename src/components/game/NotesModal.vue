<template>
  <b-modal
    class="notes"
    :id="'notes-modal-' + playerName"
    :title="playerName"
    @shown="focusMyElement"
  >
    <div>
      <!-- Element to gain focus when modal is opened -->
      <b-form-textarea
        ref="focusThis"
        id="textarea"
        placeholder="Notes..."
        rows="6"
        max-rows="6"
      ></b-form-textarea>
    </div>
    <!--include footer so OK and Cancel buttons dont show up-->
    <div slot="modal-footer"></div>
  </b-modal>
</template>

<script>
export default {
  name: "NotesModal",
  props: ["playerName"],
  methods: {
    focusMyElement(e) {
      this.$refs.focusThis.focus();
    }
  }
};
</script>

<style lang="scss">
.notes {
  .modal-header {
    background: #eae7e3;
  }
  .modal-body {
    background: #eae7e3;
    .form-control {
      background: #eae7e3; /* bootstrap 4 bg-light*/
    }
  }
  .modal-footer {
    background: #eae7e3;
  }
}
</style>


