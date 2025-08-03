import { defineStore } from "pinia";
import { IPost } from "@/modules/post-page/types";
import { apiGetPosts } from "@/modules/post-page/api";
import { errorHandler } from "@packages/frontend-helpers";

export const usePostStore = defineStore("post-store", {
  state: () => ({
    posts: [] as Array<IPost>,
  }),

  actions: {
    async getPosts() {
      try {
        const response = await apiGetPosts();
        this.posts = response.data;
      } catch (e: unknown) {
        errorHandler(e);
        throw e;
      }
    },
  },
});
