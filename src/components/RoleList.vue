<template>
  <div class="game-section mb-1 mt-2 p-0">
    <h4 class="sectionTitle">Role List</h4>
    <ul class="row lobbyList px-1 m-0">
      <div class="col-7 good">
        <li v-for="(value, character) in goodRoles">{{ character }}: {{value}}</li>
      </div>
      <div class="col-5 evil">
        <li v-for="(value, character) in evilRoles">{{ character }}: {{value}}</li>
      </div>
    </ul>
  </div>
</template>

<script>
export default {
  name: "RoleList",
  data() {
    return {
      goodRoles: null,
      evilRoles: null
    };
  },
  sockets: {
    setRoleList(data) {
      this.goodRoles = data["good"];
      this.evilRoles = data["evil"];
    }
  }
};
</script>

<style scoped>
.evil {
  color: #a42323;
}
.good {
  color: #3c48bb;
}
.sectionTitle {
  font-family: "Segoe UI", Helvetica, Arial, sans-serif;
  background: #8a7d6e;
  color: #f1f1f1 !important;
  padding: 5px 0px;
  border-radius: 5px 5px 0px 0px;
}
.game-section {
  padding: 0 !important;
}
</style>
