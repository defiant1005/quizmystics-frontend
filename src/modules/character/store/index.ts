import { defineStore } from "pinia";
import { ICharacter } from "@/modules/character/types";
import { apiGetCharacterClasses } from "@/modules/character/api";
import { errorHandler } from "@/package/helpers/error-handler";

export const useCharacterStore = defineStore("character-store", {
  state: () => ({
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
