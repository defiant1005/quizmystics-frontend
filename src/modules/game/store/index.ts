import { defineStore } from "pinia";
import { IPlayer } from "@/modules/game/types/game-types";

export const useGameStore = defineStore("game-store", {
  state: () => ({
    players: [] as IPlayer[],
    room: localStorage.getItem("room") as string | null,
    name: localStorage.getItem("name") as string | null,
  }),

  actions: {
    updatePlayers(players: IPlayer[]) {
      this.players = players;
    },

    setRoom(roomId: string, name: string) {
      this.room = roomId;
      localStorage.setItem("room", roomId);

      this.name = name;
      localStorage.setItem("name", name);
    },
  },
});
