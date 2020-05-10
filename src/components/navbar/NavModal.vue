<template>
  <b-modal :id="`modal-game-` + name" size="lg" scrollable :title="'Game ' + name">
    <div v-for="(data, index) in dataArr" :key="index">
      <h2 class="heading">
        <strong>{{data.heading}}</strong>
      </h2>
      <p v-html="data.html"></p>
    </div>
    <!--include footer so OK and Cancel buttons dont show up-->
    <div slot="modal-footer"></div>
  </b-modal>
</template>

<script>
export default {
  props: ["name", "dataArr"]
};
</script>

<style lang="scss">
.heading {
  color: #685035;
}
.modal-header {
  background: #eae7e3;
}
.modal-body {
  background: #eae7e3;
  .form-control,
  .form-control:focus,
  .form-control:active {
    background: #eae7e3; /* bootstrap 4 bg-light*/
  }
}
.modal-footer {
  background: #eae7e3;
}
</style>