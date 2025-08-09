<script lang="ts" setup>
import { computed, PropType, ref } from "vue";
import { ICharacter, IPlayer } from "@/modules/game/types";
import { useGameStore } from "@/modules/game/store";

import avatar1 from "@/assets/avatars/model1.png";
import avatar2 from "@/assets/avatars/model2.png";
import avatar3 from "@/assets/avatars/model3.png";
import avatar4 from "@/assets/avatars/model4.png";
import avatar5 from "@/assets/avatars/model5.png";
import avatar6 from "@/assets/avatars/model6.png";
import avatar7 from "@/assets/avatars/model7.png";
import avatar8 from "@/assets/avatars/model8.png";

const props = defineProps({
  player: {
    type: Object as PropType<IPlayer>,
    required: true,
  },
});

const gameStore = useGameStore();

const character = computed<ICharacter>(() =>
  gameStore.characters.find(
    (character) => character.id === props.player!.characterId
  )
);

const avatars = [
  avatar1,
  avatar2,
  avatar3,
  avatar4,
  avatar5,
  avatar6,
  avatar7,
  avatar8,
];

defineOptions({
  name: "PlayerCard",
});

const isReady = ref(false);

const toggleReady = () => {
  isReady.value = !isReady.value;
};

const modelAvatar = avatars[Math.floor(Math.random() * avatars.length)];

const isCurrentUser = computed(() => gameStore.name === props.player?.username);
</script>

<template>
  <div class="player-card" :class="{ 'player-card_ready': isReady }">
    <div v-if="isReady" class="ready-badge">✅ Готов</div>

    <div class="header">
      <div class="avatar" :class="{ 'current-user': isCurrentUser }">
        <img :src="modelAvatar" alt="avatar" />
      </div>
      <div class="info">
        <h3 class="username">
          {{ player.username }}
          <span v-if="player.isAdmin" class="admin-badge" title="Админ комнаты">
            👑
          </span>
          <span v-if="isCurrentUser" class="you-badge" title="Это вы">⭐</span>
        </h3>
        <p class="character-title">{{ character.title }}</p>
      </div>
    </div>

    <p class="description">{{ character.description }}</p>

    <div class="stats">
      <span>❤️ {{ character.lives }}</span>
      <span>🍀 {{ character.luck }}</span>
    </div>

    <div class="abilities">
      <div
        v-for="ability in character.abilities"
        :key="ability.id"
        class="ability"
        :title="ability.description"
      >
        <span class="title">{{ ability.title }}</span>
        <span class="cooldown">⏳ {{ ability.cooldown }}</span>
      </div>
    </div>

    <button
      v-if="isCurrentUser"
      type="button"
      class="ready-btn"
      @click="toggleReady"
    >
      {{ isReady ? "✅ Готов" : "🚀 Готов?" }}
    </button>
  </div>
</template>

<style lang="scss" scoped>
.player-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 260px;
  padding: 16px;
  color: #fff;
  background: #1f1f2e;
  border: 2px solid transparent;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgb(0 0 0 / 40%);
  transition: border-color 0.3s ease;

  &_ready {
    border-color: #4caf50;
  }

  .ready-badge {
    position: absolute;
    top: 8px;
    right: 8px;
    padding: 4px 8px;
    font-size: 12px;
    font-weight: bold;
    color: #fff;
    background: #4caf50;
    border-radius: 6px;
    box-shadow: 0 2px 6px rgb(0 0 0 / 30%);
  }

  .header {
    display: flex;
    gap: 12px;
    align-items: center;

    .avatar {
      position: relative;
      width: 60px;
      height: 60px;
      overflow: hidden;
      background: #333;
      border: 2px solid #444;
      border-radius: 50%;
      transition: box-shadow 0.3s ease;

      &.current-user {
        border-color: #ffeb3b;
        box-shadow: 0 0 12px 3px rgb(255 235 59 / 80%);
      }

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .info {
      .username {
        display: flex;
        gap: 4px;
        align-items: center;
        font-size: 18px;
        font-weight: bold;

        .admin-badge {
          font-size: 16px;
        }

        .you-badge {
          font-size: 14px;
          color: red !important;
        }
      }

      .character-title {
        font-size: 14px;
        color: #ccc;
      }
    }
  }

  .description {
    font-size: 13px;
    line-height: 1.3;
    color: #bbb;
  }

  .stats {
    display: flex;
    justify-content: space-between;
    font-size: 14px;
  }

  .abilities {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .ability {
      display: flex;
      justify-content: space-between;
      padding: 4px 8px;
      font-size: 13px;
      background: #2a2a3d;
      border-radius: 6px;

      .title {
        font-weight: 500;
      }

      .cooldown {
        font-size: 12px;
        color: #aaa;
      }
    }
  }

  .ready-btn {
    padding: 8px 12px;
    font-size: 14px;
    font-weight: bold;
    color: #fff;
    cursor: pointer;
    background: #ff9800;
    border: none;
    border-radius: 8px;
    transition: background 0.2s;

    &:hover {
      background: #e68a00;
    }
  }
}
</style>
