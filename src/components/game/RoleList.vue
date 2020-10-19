<template>
  <div>
    <div
      v-for="(roles, team) in roleList"
      :key="team"
      class="game-section mb-2 p-0"
      :class="{good: team === 'good', evil: team === 'evil'}"
    >
      <div class="row p-1 m-0">
        <span
          v-for="(numRoles, role) in roles"
          :key="role"
          class="mr-4"
        >{{ role }}: {{numRoles}}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      roleList: {}
    };
  },
  sockets: {
    setRoleList(roleList) {
      this.roleList = roleList;
    }
  }
};
</script>

<style scoped>
.evil {
  border-top: 5px solid #a42323;
  color: #a42323;
}
.good {
  border-top: 5px solid #3c48bb;
  color: #3c48bb;
}
.game-section {
  border-radius: 0 0 0.2rem 0.2rem;
  padding: 0;
  background: rgba(234, 231, 227, 0.5);
  box-shadow: 0 2px 5px #c2ab8e;
}
</style>
