<script lang="ts">
import { defineComponent } from "vue";
import { useGameStore } from "@/stores/game.store";
import { mapState } from "pinia";
import { useUserStore } from "@/stores/user";
//@ts-ignore
import { state } from "@/socket";

export default defineComponent({
  name: "PlayersProgress",

  emits: ["nextQuestion"],

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
    };
  },

  computed: {
    ...mapState(useGameStore, {
      userCount: "userCount",
    }),

    ...mapState(useUserStore, {
      userId: "id",
    }),

    usersList() {
      return state.usersList;
    },
  },

  watch: {
    isFinishGame() {
      console.log("Игра закончилась");
    },
  },

  methods: {
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
  },

  mounted() {
    setTimeout(() => {
      this.numbers_animation = true;

      this.usersList.forEach((user: any, index: any) => {
        if (user.oldCount !== user.count) {
          this.counter(index.toString(), user.oldCount, user.count, 2200);
          this.gameStore.setCount(user.count);
        } else {
          //иногда обновление usersList происходит не сразу, иметь в виду этот баг
          setTimeout(() => {
            if (user.oldCount !== user.count) {
              this.counter(index.toString(), user.oldCount, user.count, 2200);
            } else {
              console.error("почему-то не обновляется usersList");
            }
          }, 1000);
        }
      });

      setTimeout(() => {
        this.$emit("nextQuestion");
      }, 4000);
    }, 1000);
  },
});
</script>

<template>
  <div class="players-progress">
    <div
      v-for="(user, index) in usersList"
      :key="user.userId"
      class="players-progress__users users"
    >
      <p :id="index.toString()">0</p>
      <p>{{ user.name }}</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.players-progress {
  width: 100%;
  height: 100%;
  background: rgba(255, 0, 255, 0.6);
  display: flex;
  padding: 30px;
  flex-wrap: wrap;
  gap: 20px;

  .users {
    width: 200px;
    height: 200px;
    border-radius: 50%;
    background: rgba(26, 115, 232, 0.2);
    display: flex;
    flex-direction: column;
    gap: 8px;
    justify-content: center;
    align-items: center;

    > p {
      font-size: 22px;

      &:nth-child(1) {
        color: white;
      }
    }
  }
}
</style>