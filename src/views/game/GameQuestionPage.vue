<script lang="ts" setup>
import { useGameStore } from "@/modules/game/store";
import { computed } from "vue";

defineOptions({
  name: "GameQuestionPage",
});

const gameStore = useGameStore();

const currentQuestion = computed(() => gameStore.currentQuestion);
</script>

<template>
  <div class="game-question-page"></div>
</template>

<style lang="scss" scoped>
.game-question-page {
}
</style>
