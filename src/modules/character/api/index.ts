import { AxiosResponse } from "axios";
import API from "@/package/config/axios";
import { ICharacterResponse } from "@/modules/character/types";

export const apiGetCharacterClasses = (): Promise<
  AxiosResponse<ICharacterResponse>
> => {
  return API.get("api/character-class");
};
