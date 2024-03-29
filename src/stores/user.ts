import { defineStore } from "pinia";
import { useCookies } from "vue3-cookies";
const cookies = useCookies();

export const useUserStore = defineStore("user-store", {
  state: () => ({
    name: cookies.cookies.get("name") ?? "",
    id: null as null | string,
    room: "",
  }),

  actions: {
    renameName(name: string) {
      cookies.cookies.set("name", name);
      this.name = name;
    },

    saveId(id: string) {
      this.id = id;
    },

    setRoom(room: string) {
      this.room = room;
    },
  },
});
