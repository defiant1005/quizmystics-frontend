import { reactive } from "vue";
import { io } from "socket.io-client";
import router from "@/router/index.ts";
import { BASE_URL } from "@/package/services/axios-settings.ts";

export const state = reactive({
  connected: false,
  usersList: [],
  startGame: false,
  nextQuestion: null,
  finishGame: false,
  currentTest: null,
  question: null,
});

export const socket = io(BASE_URL, {
  autoConnect: false,
  withCredentials: true,
});

socket.on("connect", () => {
  state.connected = true;
});

socket.on("disconnect", () => {
  state.connected = false;
  state.startGame = false;
});

socket.on("updateUserList", ({ data }) => {
  state.usersList = data.users;
});

socket.on("finishQuestion", async ({ data }) => {
  state.usersList = data.users;
});

socket.on("startGame", async ({ room }) => {
  if (!state.startGame) {
    state.startGame = true;

    if (room) {
      await router.replace({
        path: `game/room/${room}`,
      });
    }
  }
});

socket.on("setTestRoom", async ({ data }) => {
  state.currentTest = data.test;
});

socket.on("finishGame", async ({ data }) => {
  state.usersList = data.users;
  state.finishGame = true;

  console.log(data);
});
