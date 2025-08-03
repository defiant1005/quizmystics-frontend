import API from "@/package/config/axios";
import { AxiosResponse } from "axios";
import { IPost } from "@/modules/post-page/types";

export const apiGetPosts = (): Promise<AxiosResponse<IPost[]>> => {
  return API.get("posts");
};
