export interface IPlayer {
  id: string;
  username: string;
  character: null;
}

export interface IEnterRoomForm {
  name: string;
  roomId: string;
  characterId: number | "";
}

export interface ICreateRoomForm extends Omit<IEnterRoomForm, "roomId"> {}

export type CharacterLives = 1 | 2 | 3;

export enum AbilitySlug {
  LUCK = "luck",
  FREEZE = "freeze",
  HIDE_QUESTION = "hide-question",
  HIDE_ONE = "hide-one",
  SHUFFLE = "shuffle",
  REMOVE_WRONG = "remove-wrong",
  COPY_ANSWER = "copy-answer",
  SILENCE = "silence",
  BKB = "bkb",
  REFLECT = "reflect",
  SHORT_TIME = "short-time",
  PEEK = "peek",
  DOUBLE_SHOT = "double-shot",
  TRAP_QUESTION = "trap-question",
  REMOVE_LUCK = "remove-luck",
}

export interface IAbility {
  id: number;
  title: string;
  slug: AbilitySlug;
  description: string;
}

export interface ICharacterAbility extends IAbility {
  cooldown: number;
}

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
