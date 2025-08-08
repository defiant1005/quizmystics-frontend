import { ICharacterResponse } from "@/modules/game/types";
import { AxiosResponse } from "axios";
import API from "@/package/config/axios";

export const apiGetCharacterClasses = (): Promise<
  AxiosResponse<ICharacterResponse>
> => {
  return API.get("api/character-class");
};
