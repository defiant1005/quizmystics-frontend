<script lang="ts" setup>
import { useGameStore } from "@/modules/game/store";
import { computed, onMounted } from "vue";
import socket from "@/package/config/socket";
import {
  ClientToServerEvents,
  ServerToClientEvents,
} from "@/modules/game/types/socket-types";
import {
  IGetQuestionsParams,
  IGetSpellInfoParams,
} from "@/modules/game/types/client-server-response-types";
import {
  IGameQuestion,
  IGetSpellsResponse,
} from "@/modules/game/types/server-client-response-types";
import { useRouter } from "vue-router";
import { RouteNames } from "@/router/routes";

defineOptions({
  name: "ChoosingCategory",
});

const gameStore = useGameStore();
const router = useRouter();

const isMeChooser = computed(() => gameStore.isMeChooser);
const currentCategories = computed(() => gameStore.currentCategories);
const currentCategoryChooser = computed(() => gameStore.currentCategoryChooser);

function chooseCategory(categoryId: number) {
  if (!isMeChooser.value) {
    return;
  }

  const params: IGetQuestionsParams = {
    categoryId,
    roomId: gameStore.room as string,
  };

  socket.emit(ClientToServerEvents.GET_QUESTIONS, params);
}

onMounted(() => {
  socket.on(ServerToClientEvents.NEW_QUESTION, async (data: IGameQuestion) => {
    gameStore.setGameQuestion(data);

    const params: IGetSpellInfoParams = {
      roomId: gameStore.room as string,
      username: gameStore.name as string,
    };

    socket.emit(ClientToServerEvents.GET_SPELL_INFO, params);
  });

  socket.on(
    ServerToClientEvents.SPELL_INFO,
    async (data: IGetSpellsResponse) => {
      gameStore.setSpells(data.spells);

      await router.replace({
        name: RouteNames.CHOOSING_VICTIM_PAGE,
      });
    }
  );
});
</script>

<template>
  <div class="choosing-category">
    <div class="choosing-category__header">
      <p v-if="isMeChooser" class="choosing-category__title">
        🃏 Выберите категорию
      </p>
      <p v-else class="choosing-category__title">
        ⏳ Ждём, пока
        <span class="choosing-category__player">
          {{ currentCategoryChooser }}
        </span>
        выберет категорию
      </p>
    </div>

    <div class="choosing-category__list">
      <button
        v-for="category in currentCategories"
        :key="category.id"
        type="button"
        class="choosing-category__item"
        :class="{ 'choosing-category__item--disabled': !isMeChooser }"
        :disabled="!isMeChooser"
        @click="chooseCategory(category.id)"
      >
        {{ category.title }}
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.choosing-category {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  text-align: center;

  &__header {
    margin-bottom: 2rem;
  }

  &__title {
    font-size: 1.5rem;
    font-weight: 700;
    color: #fff;
    text-shadow: 0 0 6px rgb(0 0 0 / 50%);
  }

  &__player {
    font-weight: 700;
    color: #ffd54f;
  }

  &__list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 1rem;
    width: 100%;
    max-width: 700px;
  }

  &__item {
    padding: 1rem;
    font-size: 1.2rem;
    font-weight: 600;
    color: #fff;
    cursor: pointer;
    background: linear-gradient(135deg, #ff6f61, #ff8a65);
    border: none;
    border-radius: 1rem;
    box-shadow: 0 4px 10px rgb(0 0 0 / 20%);
    transition:
      transform 0.15s ease,
      box-shadow 0.15s ease;

    &:hover:not(:disabled) {
      box-shadow: 0 6px 14px rgb(0 0 0 / 25%);
      transform: translateY(-3px);
    }

    &:active:not(:disabled) {
      box-shadow: 0 2px 6px rgb(0 0 0 / 25%);
      transform: translateY(1px);
    }

    &--disabled {
      cursor: default;
      opacity: 0.6;
    }
  }
}
</style>
