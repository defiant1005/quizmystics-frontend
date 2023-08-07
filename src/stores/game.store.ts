import { defineStore } from "pinia";
import * as questionsApi from "@/api/questions";
import { IQuestion } from "@/intefaces/IGame";

export const useGameStore = defineStore("game-store", {
  state: () => ({
    question: null as null | IQuestion,

    userCount: 0,
  }),

  actions: {
    getOneQuestion(id: number) {
      return new Promise((resolve, reject) => {
        questionsApi
          .apiGetOneQuestions(id)
          .then((response) => {
            this.question = response.data;
            resolve(response);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },

    setCount(countValue: number) {
      this.userCount += countValue;
    },
  },
});
