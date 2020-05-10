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
  name: "RoleList",
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
.sectionTitle {
  font-family: "Segoe UI", Helvetica, Arial, sans-serif;
  background: #8a7d6e;
  color: #f1f1f1 !important;
  padding: 5px 0px;
  border-radius: 5px 5px 0px 0px;
}
.game-section {
  border-radius: 0 0 0.2rem 0.2rem;
  padding: 0 !important;
}
</style>
