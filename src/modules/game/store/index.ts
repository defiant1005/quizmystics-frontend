import { defineStore } from "pinia";
import { IPlayer } from "@/modules/game/types/game-types";
import {
  ICategory,
  IGameQuestion,
} from "@/modules/game/types/server-client-response-types";

export const useGameStore = defineStore("game-store", {
  state: () => {
    return {
      players: [] as IPlayer[],
      room: localStorage.getItem("room") as string | null,
      name: localStorage.getItem("name") as string | null,
      isHost: false,

      currentCategoryChooser: "",
      currentCategories: [] as ICategory[],

      currentQuestion: {} as IGameQuestion,
    };
  },

  getters: {
    isMeChooser(state) {
      return state.name === state.currentCategoryChooser;
    },
  },

  actions: {
    updatePlayers(players: IPlayer[]) {
      this.players = players;
    },

    setRoom(roomId: string, name: string, isHost: boolean = false) {
      this.room = roomId;
      localStorage.setItem("room", roomId);

      this.name = name;
      localStorage.setItem("name", name);

      this.isHost = isHost;
    },

    categoryTurn(chooser: string, categories: ICategory[]) {
      this.currentCategoryChooser = chooser;
      this.currentCategories = categories;
    },

    setGameQuestion(question: IGameQuestion) {
      this.currentQuestion = question;
    },
  },
});
