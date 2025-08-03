import { defineStore } from "pinia";
import { IPost } from "@/modules/post-page/types";
import { apiGetPosts } from "@/modules/post-page/api";

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
        console.log(e);
        throw e;
      }
    },
  },
});
