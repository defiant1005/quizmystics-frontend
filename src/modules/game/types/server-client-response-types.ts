import { IPlayer } from "./game-types.js";

export interface IUpdatePlayersResponse {
  players: IPlayer[];
}

export interface ISuccessEnterResponse {
  roomId: string;
  name: string;
}

export interface IRoomCreatedResponse {
  roomId: string;
  socketId: string;
  name: string;
  isHost: boolean;
}

export interface ICategory {
  id: number;
  title: string;
}

export interface ICategoryTurnResponse {
  chooser: string;
  categories: ICategory[];
}

export enum AnswerVariant {
  ANSWER1 = "answer1",
  ANSWER2 = "answer2",
  ANSWER3 = "answer3",
  ANSWER4 = "answer4",
}

export interface IGameQuestion {
  title: string;

  [AnswerVariant.ANSWER1]: string;
  [AnswerVariant.ANSWER2]: string;
  [AnswerVariant.ANSWER3]: string;
  [AnswerVariant.ANSWER4]: string;
}
