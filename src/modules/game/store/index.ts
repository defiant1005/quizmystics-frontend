import { defineStore } from "pinia";
import { ICharacter, IPlayer } from "@/modules/game/types";
import { apiGetCharacterClasses } from "@/modules/game/api";
import { errorHandler } from "@/package/helpers/error-handler";

export const useGameStore = defineStore("game-store", {
  state: () => ({
    players: [] as IPlayer[],
    room: localStorage.getItem("room") as string | null,
    socketId: localStorage.getItem("socketId") as string | null,
    characters: [] as ICharacter[],
  }),

  getters: {
    characterOptions(state) {
      return state.characters.map((character) => ({
        value: character.id,
        label: character.title,
      }));
    },
  },

  actions: {
    changePlayersCount(players: IPlayer[]) {
      this.players = players;
    },

    setRoom(roomId: string, socketId: string) {
      this.room = roomId;
      localStorage.setItem("room", roomId);

      this.socketId = socketId;
      localStorage.setItem("socketId", socketId);
    },

    async getCharacters() {
      try {
        const response = await apiGetCharacterClasses();
        this.characters = response.data.data;
      } catch (error: unknown) {
        errorHandler(error);
        throw error;
      }
    },
  },
});
