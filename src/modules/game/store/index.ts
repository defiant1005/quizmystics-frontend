import { defineStore } from "pinia";
import { IPlayer } from "@/modules/game/types/game-types";
import {
  IAbilitiesResolved,
  ICategory,
  IGameQuestion,
  ISpellInfo,
  IVictimAbilities,
  IVictimAbilitiesGroupedByTarget,
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

      spells: [] as ISpellInfo[],

      victimsAbilities: {} as IAbilitiesResolved,
    };
  },

  getters: {
    isMeChooser(state) {
      return state.name === state.currentCategoryChooser;
    },

    victimAbilitiesGroupedByTarget(state): IVictimAbilitiesGroupedByTarget {
      const arr = state.victimsAbilities?.results ?? [];
      const map = new Map<string, IVictimAbilities[]>();

      for (const item of arr) {
        const list = map.get(item.to);
        if (list) {
          list.push(item);
        } else {
          map.set(item.to, [item]);
        }
      }

      return Array.from(map.entries()).map(([to, hits]) => ({ to, hits }));
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

    setSpells(spells: ISpellInfo[]) {
      this.spells = spells;
    },

    setVictimAbilities(abilities: IAbilitiesResolved) {
      this.victimsAbilities = abilities;
    },
  },
});
