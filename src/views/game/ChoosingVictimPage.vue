<script lang="ts" setup>
import { useGameStore } from "@/modules/game/store";

defineOptions({
  name: "ChoosingVictimPage",
});

const gameStore = useGameStore();
</script>

<template>
  <div class="choosing-victim-page">choosing-victim-page</div>
</template>

<style lang="scss" scoped>
.choosing-victim-page {
}
</style>
