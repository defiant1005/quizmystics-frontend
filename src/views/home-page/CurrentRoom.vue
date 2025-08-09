<script lang="ts" setup>
import { useRouteParams } from "@vueuse/router";
import { Check, CopyDocument } from "@element-plus/icons-vue";
import { computed, onMounted, ref } from "vue";
import { ElNotification } from "element-plus";
import { useGameStore } from "@/modules/game/store";
import PlayerCard from "@/modules/game/components/PlayerCard.vue";

defineOptions({
  name: "CurrentRoom",
});

const isCheck = ref(false);

const playersStore = useGameStore();
const playersList = computed(() => playersStore.players);

const currentIcon = computed(() => (isCheck.value ? Check : CopyDocument));

const roomId = useRouteParams("id", "AAAA");

const copyRoomId = async () => {
  isCheck.value = true;

  try {
    await navigator.clipboard.writeText(roomId.value);
    ElNotification({
      title: "Скопировано",
      type: "success",
      position: "bottom-right",
    });
  } catch (error) {
    console.error(error);
  }
};

onMounted(() => {});
</script>

<template>
  <div class="create-room">
    <div class="main-container">
      <p>
        Ваша комната:
        <span :class="{ success: isCheck }">
          {{ roomId }}
          <ElIcon @click="copyRoomId">
            <component :is="currentIcon" />
          </ElIcon>
        </span>
      </p>

      <div class="create-room__players-list">
        <PlayerCard
          v-for="player in playersList"
          :key="player.id"
          :player="player"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.create-room {
  .main-container {
    display: flex;
    flex-direction: column;
    gap: 24px;

    > p {
      display: flex;
      gap: 4px;
      align-items: center;

      @include body-M;

      > span {
        display: flex;
        gap: 4px;
        align-items: center;
      }

      .success {
        color: rgb(133 206 97);
      }
    }
  }

  &__players-list {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }
}
</style>
