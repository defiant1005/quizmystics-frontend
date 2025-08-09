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
