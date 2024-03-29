<script lang="ts">
import { defineComponent, PropType } from "vue";
import { IPlayers } from "@/intefaces/IGame";

export default defineComponent({
  name: "UserCard",
  emits: ["openDrawer"],

  props: {
    user: {
      type: Object as PropType<IPlayers>,
      required: true,
    },

    disabled: {
      type: Boolean,
      default: true,
    },

    isRoomAdmin: {
      type: Boolean,
      default: false,
    },

    isShowOtherStats: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    showStats() {
      return this.user.stats && this.isShowOtherStats;
    },

    showSettings() {
      return !this.user.stats && !this.disabled;
    },
  },

  methods: {
    openDrawer() {
      if (!this.disabled) {
        this.$emit("openDrawer", this.user.userId);
      }
    },
  },
});
</script>

<template>
  <div
    class="user-card"
    :class="[
      { 'user-card_disabled': disabled },
      { 'user-card_is-ready': user.isReady },
    ]"
    @click="openDrawer"
  >
    <div class="user-card__left left">
      <img :src="user.avatar" alt="ava" />

      <p>
        {{ user.name }}
        <span v-if="!disabled">(Вы)</span>
        <span v-if="user.isRoomAdmin" class="left__vip">VIP</span>
      </p>
    </div>

    <div v-if="showStats" class="user-card__stats stats">
      <div class="stats__stat stat">
        <span class="icon-health" />
        <p>{{ user.stats!.health }}</p>
      </div>

      <div class="stats__stat stat">
        <span class="icon-power" />
        <p>{{ user.stats!.power }}</p>
      </div>

      <div class="stats__stat stat">
        <span class="icon-magic" />
        <p>{{ user.stats!.magic }}</p>
      </div>

      <div class="stats__stat stat">
        <span class="icon-intelligence" />
        <p>{{ user.stats!.intelligence }}</p>
      </div>

      <div class="stats__stat stat">
        <span class="icon-luck" />
        <p>{{ user.stats!.luck }}</p>
      </div>
    </div>

    <span v-else-if="showSettings" class="icon-settings user-card__settings" />
  </div>
</template>

<style lang="scss" scoped>
.user-card {
  width: 100%;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  border-radius: 16px;
  border: 2px solid $black;
  box-shadow: 0 4px 0 0 #18191f;
  position: relative;
  transition: top 0.5s ease-out;
  background: $yellow-800;
  padding: 8px 16px;

  &:not(&_disabled):active {
    box-shadow: none;
    top: 4px;
  }

  &_disabled {
    cursor: default;
  }

  &_is-ready {
    background: $green-800;
  }

  .left {
    display: flex;
    align-items: center;
    gap: 8px;

    > img {
      width: 32px;
      height: 32px;
    }

    > p {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;
      @include text-1;
      color: $black;
    }

    &__vip {
      color: $blue;
      @include text-2;
    }
  }

  .stats {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 8px;

    .stat {
      display: flex;
      flex-direction: column;
      align-items: center;

      gap: 4px;

      > span {
        width: 16px;
        height: 16px;
        background: $black;
      }

      > p {
        color: $black;
        @include text-2;
        margin: 0;
      }
    }
  }

  &__settings {
    width: 24px;
    height: 24px;
    background: $black;
  }
}
</style>
