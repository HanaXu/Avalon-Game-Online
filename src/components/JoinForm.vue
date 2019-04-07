<template>
  <div class="jumbo">
    <b-form inline>
      <label class="sr-only" for="inline-form-input-name">Name</label>
      <b-input id="inline-form-input-name" class="mb-2 mr-sm-2 mb-sm-0" placeholder="Name"></b-input>

      <label class="sr-only" for="inline-form-input-roomCode">roomCode</label>
      <b-input-group class="mb-2 mr-sm-2 mb-sm-0">
        <b-input id="inline-form-input-roomCode" placeholder="roomCode"></b-input>
      </b-input-group>

      <b-button class="avalon-btn-lg">Join Room</b-button>
    </b-form>
    
  </div>
</template>

<script>
export default {
  name: 'JoinForm'
};
</script>

<style scoped>
.jumbo {
  margin-top: 30%;
}
</style>
