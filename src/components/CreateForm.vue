<template>
  <div class="jumbo">
    <b-form inline>
      <label class="sr-only" for="inline-form-input-name">Name</label>
      <b-input id="inline-form-input-name" class="mb-2 mr-sm-2 mb-sm-0" placeholder="Name"></b-input>

      <b-button class="avalon-btn-lg">Create Room</b-button>
    </b-form>
  </div>
</template>

<script>
export default {
  name: 'CreateForm'
};
</script>

<style scoped>
.jumbo {
  margin-top: 30%;
}
</style>
