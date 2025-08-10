<script lang="ts" setup>
import socket from "@/package/config/socket";
import { onBeforeUnmount, onMounted } from "vue";
import { ElNotification } from "element-plus";
import { useRoute, useRouter } from "vue-router";
import { RouteNames } from "@/router/routes";
import { useGameStore } from "@/modules/game/store";

import { useCharacterStore } from "@/modules/character/store";
import {
  ClientToServerEvents,
  ServerToClientEvents,
  SocketErrorPayload,
  SocketErrorSlug,
} from "@/modules/game/types/socket-types";
import { IUpdatePlayersResponse } from "@/modules/game/types/server-client-response-types";
import {
  IGetPlayersParams,
  IInterRoomParams,
} from "@/modules/game/types/client-server-response-types";

const route = useRoute();
const router = useRouter();
const gameStore = useGameStore();
const characterStore = useCharacterStore();

const getDefaultData = async () => {
  const promises = [characterStore.getCharacters().then()];

  await Promise.all(promises);
};

function updatePlayersHandler(data: IUpdatePlayersResponse) {
  gameStore.updatePlayers(data.players);
}

function errorHandler(data: SocketErrorPayload) {
  ElNotification({
    title: data.message,
    type: "error",
    position: "bottom-right",
  });

  if (
    route.name === RouteNames.CURRENT_ROOM &&
    data.slug === SocketErrorSlug.ALREADY_EXISTS
  ) {
    router.replace({
      name: RouteNames.HOME_VIEW,
    });
  }
}

function gameOverHandler() {
  ElNotification({
    title: "Игра закончена",
    type: "success",
    position: "bottom-right",
  });
}

onMounted(async () => {
  await getDefaultData();

  if (gameStore.room && gameStore.name) {
    const enterRoomParams: IInterRoomParams = {
      roomId: gameStore.room,
      name: gameStore.name,
    };

    socket.emit(ClientToServerEvents.ENTER_ROOM, enterRoomParams);

    const params: IGetPlayersParams = {
      roomId: gameStore.room,
    };

    socket.emit(ClientToServerEvents.GET_PLAYERS, params);
  }

  socket.on(ServerToClientEvents.UPDATE_PLAYERS, updatePlayersHandler);

  socket.on(ServerToClientEvents.ERROR, errorHandler);

  socket.on(ServerToClientEvents.GAME_OVER, gameOverHandler);
});

onBeforeUnmount(() => {
  socket.off(ServerToClientEvents.UPDATE_PLAYERS, updatePlayersHandler);

  socket.off(ServerToClientEvents.ERROR, errorHandler);

  socket.off(ServerToClientEvents.GAME_OVER, gameOverHandler);
});
</script>

<template>
  <RouterView />
</template>
