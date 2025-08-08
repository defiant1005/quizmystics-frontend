<script lang="ts" setup>
import { PropType } from "vue";
import { IPlayer } from "@/modules/game/types";

defineProps({
  player: {
    type: Object as PropType<IPlayer>,
    required: true,
  },
});

defineOptions({
  name: "PlayerCard",
});
</script>

<template>
  <div class="user-card">
    <p>{{ player.id }}</p>
  </div>
</template>

<style lang="scss" scoped>
.user-card {
}
</style>
