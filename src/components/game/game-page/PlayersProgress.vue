<script lang="ts">
import { defineComponent } from "vue";
import { useGameStore } from "@/stores/game.store";
//@ts-ignore
import { state, socket } from "@/socket";
import { IPlayers } from "@/intefaces/IGame";
import { mapState } from "pinia";
import { useUserStore } from "@/stores/user";
import delay from "@/package/helpers/delay";

export default defineComponent({
  name: "PlayersProgress",
  emits: ["nextStep"],

  props: {
    isFinishGame: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    const gameStore = useGameStore();

    return {
      gameStore,
      numbers_animation: false,

      myUserList: [] as Array<IPlayers>,

      isShowDelta: true,

      deltaDelay: 750,
      deltaAnimation: 1200,

      deltaCount: 1000,
    };
  },

  computed: {
    ...mapState(useUserStore, {
      room: "room",
    }),

    usersList() {
      return state.usersList;
    },

    getDeltaDelay() {
      return this.deltaDelay + "ms";
    },

    getDeltaAnimation() {
      return this.deltaAnimation + "ms";
    },

    winnerUsers() {
      return this.usersList.map((user: IPlayers) => {
        if (user.count > user.oldCount) {
          return user.userId;
        }
      });
    },
  },

  watch: {
    usersList: {
      handler(newValue) {
        this.myUserList = newValue;
      },

      deep: true,
    },

    isFinishGame() {
      console.log("Игра закончилась");
    },
  },

  methods: {
    delay,

    counter(id: string, start: number, end: number, duration: number) {
      const obj: any = document.getElementById(id);
      let current = start;
      const range = end - start;
      if (range !== 0) {
        const increment = end > start ? 1 : -1;

        const step = Math.abs(Math.floor(duration / range));

        const timer = setInterval(() => {
          current += increment;
          obj.textContent = current;
          if (current === end) {
            clearInterval(timer);
          }
        }, step);
      } else {
        console.error({
          id,
          start,
          end,
          duration,
        });
      }
    },

    setDelta(user: IPlayers) {
      if (user.count - user.oldCount > 0) {
        return `+${user.count - user.oldCount}`;
      } else {
        return `${user.count - user.oldCount}`;
      }
    },

    sortUserListOldCount() {
      this.myUserList = this.usersList.sort(function (
        a: IPlayers,
        b: IPlayers
      ) {
        return b.oldCount - a.oldCount;
      });
    },

    sortUserListNewCount() {
      this.myUserList = this.usersList.sort(function (
        a: IPlayers,
        b: IPlayers
      ) {
        return b.count - a.count;
      });
    },
  },

  async mounted() {
    this.sortUserListOldCount();

    await delay(2000);

    this.isShowDelta = false;

    this.numbers_animation = true;

    this.myUserList.forEach((user: IPlayers, index: number) => {
      if (user.oldCount !== user.count) {
        this.counter(
          index.toString(),
          user.oldCount,
          user.count,
          this.deltaCount
        );
        this.gameStore.setCount(user.count);
      }
    });

    await delay(this.deltaCount + 1000);

    this.sortUserListNewCount();

    await delay(2000);

    const normalize = {
      room: this.room,
      usersId: this.winnerUsers,
    };
    socket.emit("updateOldCount", normalize);
    this.$emit("nextStep");
  },
});
</script>

<template>
  <div class="players-progress">
    <TransitionGroup tag="ul" name="fade" class="container">
      <div
        v-for="(user, index) in myUserList"
        :key="user.userId"
        :class="[
          { users_vip: index === 0 },
          { users_death: user.stats!.health === 0 },
        ]"
        class="players-progress__users users"
      >
        <div class="users__left left">
          <img :src="user.avatar" alt="ava" v-if="user.stats!.health !== 0" />
          <img src="@/assets/icons/death.svg" alt="ava" v-else />
          <p>{{ user.name }}</p>
        </div>

        <p
          class="users__delta"
          v-if="isShowDelta && user.count - user.oldCount !== 0"
          :class="[
            {
              users__delta_green: user.count - user.oldCount > 0,
            },
            {
              users__delta_red: user.count - user.oldCount < 0,
            },
          ]"
        >
          {{ setDelta(user) }}
        </p>

        <p :id="index.toString()">{{ user.oldCount ?? 0 }}</p>
      </div>
    </TransitionGroup>
  </div>
</template>

<style lang="scss" scoped>
.players-progress {
  width: 100%;
  height: 100%;
  background: $pink-800;
  padding: 30px;

  .container {
    display: flex;
    flex-direction: column;
    gap: 20px;
    position: relative;
    padding: 0;
  }

  .users {
    width: 100%;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-radius: 16px;
    border: 2px solid $black;
    position: relative;
    transition: all 0.5s ease-out;
    background: $yellow-800;
    padding: 8px 16px;
    box-sizing: border-box;

    &_vip {
      background: $blue-800;
    }

    &_death {
      background: $black-800 !important;
    }

    .left {
      width: fit-content;
      height: 100%;
      display: flex;
      align-items: center;
      gap: 12px;

      > img {
        width: 100%;
        height: 100%;
      }
    }

    &__delta {
      position: absolute;
      top: 50%;
      right: 80px;
      transform: translate(0, -50%);
      animation: delta-animation v-bind(getDeltaAnimation) ease-out;
      animation-delay: v-bind(getDeltaDelay);
      opacity: 0;

      &_green {
        color: $green;
      }

      &_red {
        color: $red;
      }
    }

    p {
      font-size: 22px;
      margin-bottom: 0;
      @include text-1;

      &:nth-child(1) {
        color: $black;
      }
    }
  }

  .fade-move,
  .fade-enter-active,
  .fade-leave-active {
    transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1);
  }

  /* 2. declare enter from and leave to state */
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
    transform: scaleY(0.01) translate(30px, 0);
  }

  /* 3. ensure leaving items are taken out of layout flow so that moving
        animations can be calculated correctly. */
  .fade-leave-active {
    position: absolute;
  }
}

@keyframes delta-animation {
  0% {
    opacity: 1;
  }

  95% {
    opacity: 1;
  }

  100% {
    opacity: 0;
  }
}
</style>
