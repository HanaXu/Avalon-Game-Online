<template>
  <b-modal :id="'memo-modal-' + playerName" :title="playerName + ' Memo'" @shown="focusMyElement">
    <div>
      <!-- Element to gain focus when modal is opened -->
      <b-form-textarea
        ref="focusThis"
        id="textarea"
        placeholder="Enter something..."
        rows="5"
        max-rows="5"
      ></b-form-textarea>
    </div>
    <!--include footer so OK and Cancel buttons dont show up-->
    <div slot="modal-footer"></div>
  </b-modal>
</template>

<script>
export default {
  name: "MemoModal",
  props: ["playerName"],
  methods: {
    focusMyElement(e) {
      this.$refs.focusThis.focus();
    }
  }
};
</script>


