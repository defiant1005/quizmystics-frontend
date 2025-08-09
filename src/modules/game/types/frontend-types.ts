export interface IEnterRoomForm {
  name: string;
  roomId: string;
  characterId: number | "";
}

export interface ICreateRoomForm extends Omit<IEnterRoomForm, "roomId"> {}
