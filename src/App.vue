<script lang="ts" setup>
import socket from "@/package/config/socket";
import { onMounted } from "vue";
import { ElNotification } from "element-plus";
import { useRoute, useRouter } from "vue-router";
import { RouteNames } from "@/router/routes";
import { useGameStore } from "@/modules/game/store";
import {
  ClientToServerEvents,
  ServerToClientEvents,
  SocketErrorPayload,
  SocketErrorSlug,
} from "@/modules/socket/types";

const route = useRoute();
const router = useRouter();
const gameStore = useGameStore();

const getDefaultData = async () => {
  const promises = [gameStore.getCharacters()];

  await Promise.all(promises);
};

onMounted(async () => {
  await getDefaultData();

  if (gameStore.room && gameStore.socketId) {
    socket.emit(ClientToServerEvents.ENTER_ROOM, {
      roomId: gameStore.room,
      socketId: gameStore.socketId,
    });

    socket.emit(ClientToServerEvents.GET_PLAYERS, {
      roomId: gameStore.room,
    });
  }

  socket.on(ServerToClientEvents.SET_PLAYERS, ({ players }) => {
    gameStore.changePlayersCount(players);
  });

  socket.on(
    ServerToClientEvents.ERROR,
    ({ message, slug }: SocketErrorPayload) => {
      ElNotification({
        title: message,
        type: "error",
        position: "bottom-right",
      });

      if (
        route.name === RouteNames.CURRENT_ROOM &&
        slug === SocketErrorSlug.ALREADY_EXISTS
      ) {
        router.replace({
          name: RouteNames.HOME_VIEW,
        });
      }
    }
  );

  socket.on(ServerToClientEvents.CHANGE_PLAYERS_COUNT, ({ players }) => {
    gameStore.changePlayersCount(players);
  });
});
</script>

<template>
  <RouterView />
</template>
