<template>
  <div class="field" @click="show = !show">
    <div class="content" v-show="show">
      X
    </div>
  </div>
</template>

<script>
export default {
  name: "Field",
  data: function() {
    return {
      show: false,
    };
  },
}
</script>

<style scoped>
.field {
  width: 150px;
  height: 150px;
  border: black solid 1px;
  font-size: 100px;
}

.content {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>