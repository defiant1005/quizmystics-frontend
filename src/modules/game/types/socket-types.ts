export enum ClientToServerEvents {
  CREATE_ROOM = "createRoom",
  ENTER_ROOM = "enterRoom",
  GET_PLAYERS = "getPlayers",
  CHANGE_PLAYER_READY = "changePlayerReady",
  DISCONNECT = "disconnect",
}

export enum ServerToClientEvents {
  ROOM_CREATED = "roomCreated",
  UPDATE_PLAYERS = "updatePlayers",
  SUCCESS_ENTER = "successEnter",

  ERROR = "error",
}

export enum SocketErrorSlug {
  ALREADY_EXISTS = "already_exists",
  NOT_FOUND = "not_found",
  VALIDATE_ERROR = "validate_error",
  ROOM_NOT_FOUND = "room_not_found",
  GAME_IN_PROGRESS = "game_in_progress",
  NAME_TAKEN = "name_taken",
}

export interface SocketErrorPayload {
  message: string;
  slug: SocketErrorSlug;
}
