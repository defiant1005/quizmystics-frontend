<script lang="ts" setup>
import { defineComponent } from "vue";

defineComponent({
  name: "MainLayout",
});
</script>

<template>
  <div class="main-layout">
    <RouterView />
  </div>
</template>

<style lang="scss" scoped>
.main-layout {
  height: 100%;
}
</style>
