import { defineStore } from "pinia";
import { IPlayer } from "@/modules/player/types";

export const usePlayersStore = defineStore("players-store", {
  state: () => ({
    players: [] as IPlayer[],
  }),

  actions: {
    changePlayersCount(players: IPlayer[]) {
      this.players = players;
    },
  },
});
