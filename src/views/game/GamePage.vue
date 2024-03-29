<script lang="ts">
import { defineComponent } from "vue";
import { mapState } from "pinia";
import QuestionGame from "@/components/game/game-page/QuestionGame.vue";
import { useGameStore } from "@/stores/game.store";
import { useUserStore } from "@/stores/user";
import PlayersProgress from "@/components/game/game-page/PlayersProgress.vue";
//@ts-ignore
import { state, socket } from "@/socket";

import MagicUsage from "@/components/game/game-page/magic-usage/MagicUsage.vue";
import { ICurse, IPlayers, IQuestion } from "@/intefaces/IGame";
import TestRoom from "@/components/game/game-page/test-room/TestRoom.vue";
import SetCategory from "@/components/game/game-page/SetCategory.vue";

export default defineComponent({
  name: "GamePage",

  components: {
    SetCategory,
    TestRoom,
    MagicUsage,
    PlayersProgress,
    QuestionGame,
  },

  data() {
    const gameStore = useGameStore();

    return {
      gameStore,
      timer: 5,
      choiceAnswer: "",
      step: 0,
    };
  },

  computed: {
    ...mapState(useGameStore, {
      question: "question",
    }),

    ...mapState(useUserStore, {
      userId: "id",
      room: "room",
    }),

    isFinishGame() {
      return state.finishGame;
    },

    isShowQuestion() {
      return this.question && !this.isFinishGame && this.step === 3;
    },

    isShowTimer() {
      return this.timer > -1 && this.step === 0;
    },

    userList() {
      return state.usersList;
    },

    currentUser() {
      return this.userList.find(
        (user: IPlayers) => user.userId === this.userId
      );
    },

    currentUserCurse() {
      return this.currentUser.curse?.map((curse: ICurse) => {
        if (!curse.evaded) {
          return curse.spell;
        }
      });
    },
  },

  methods: {
    choiceAnswerHandler(answer: string) {
      this.choiceAnswer = answer;
    },

    startTimer() {
      this.timer--;

      if (this.timer > -1) {
        setTimeout(() => {
          this.startTimer();
        }, 1000);
      }
    },

    setAnswerHandler() {
      if (this.question?.id && this.userId) {
        const answerData = {
          id: this.question.id,
          answer: this.choiceAnswer,
          userId: this.userId,
          room: this.room,
        };

        socket.emit("changeUserCount", answerData);

        this.choiceAnswer = "";

        this.step = 4;
      } else {
        console.error("Неожиданное поведение");
      }
    },

    nextStepHandler() {
      if (this.step === 4) {
        this.step = 5;
      } else {
        this.step = 1;
      }
    },

    animationEndHandler() {
      this.step = 3;
    },

    finishTestHandler() {
      this.step = 6;
    },
  },

  async mounted() {
    setTimeout(() => {
      this.step = 1;
    }, this.timer * 1000);

    setTimeout(() => {
      this.startTimer();
    }, 500);
  },

  created() {
    socket.on("currentQuestion", (question: IQuestion) => {
      this.gameStore.setQuestion(question);
      this.step = 2;
    });
  },
});
</script>

<template>
  <div class="game-page" :class="{ 'game-page_active': timer > -1 }">
    <div v-if="isShowTimer" class="game-page__timer timer">
      {{ timer }}
    </div>

    <SetCategory v-else-if="step === 1" :user-list="userList" />

    <MagicUsage
      v-else-if="step === 2"
      :current-user="currentUser"
      :user-list="userList"
      @animationEnd="animationEndHandler"
    />

    <div v-else-if="isShowQuestion && step === 3" class="game-page__game game">
      <QuestionGame
        :question="question!"
        :curse="currentUserCurse"
        :active-answer="choiceAnswer"
        @choiceAnswer="choiceAnswerHandler"
        @setAnswer="setAnswerHandler"
      />
    </div>

    <div
      v-else-if="step === 4 || step === 6"
      class="game-page__progress progress"
    >
      <PlayersProgress
        :is-finish-game="isFinishGame"
        @nextStep="nextStepHandler"
      />
    </div>

    <div v-else-if="step === 5" class="game-page__progress progress">
      <TestRoom @finishTest="finishTestHandler" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.game-page {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: $yellow-100;
  transition: all 1s ease;

  &_active {
    background: $blue-100;
  }

  .timer {
    width: 100px;
    height: 100px;
    background: $white;
    color: $blue-100;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 26px;
  }

  .game {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .progress {
    width: 100%;
    height: 100%;
  }
}
</style>
