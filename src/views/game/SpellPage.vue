<script lang="ts" setup>
import { useGameStore } from "@/modules/game/store";
import { computed } from "vue";

defineOptions({
  name: "SpellPage",
});

const gameStore = useGameStore();

const victimsAbilitiesResult = computed(
  () => gameStore.victimsAbilities.results
);
</script>

<template>
  <div class="spell-page"></div>
</template>

<style lang="scss" scoped>
.spell-page {
}
</style>
