import { ICharacterAbility } from "@/modules/ability/types";

export type CharacterLives = 1 | 2 | 3;

export interface ICharacter {
  id: number;
  title: string;
  description: string;
  luck: number;
  lives: CharacterLives;
  abilities: ICharacterAbility[];
}

export interface ICharacterResponse {
  data: ICharacter[];
}
