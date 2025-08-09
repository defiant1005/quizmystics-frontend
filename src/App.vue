<script lang="ts" setup>
import socket from "@/package/config/socket";
import { onMounted } from "vue";
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

  socket.on(
    ServerToClientEvents.UPDATE_PLAYERS,
    (data: IUpdatePlayersResponse) => {
      gameStore.updatePlayers(data.players);
    }
  );

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

  socket.on(ServerToClientEvents.GAME_OVER, () => {
    ElNotification({
      title: "Игра закончена",
      type: "success",
      position: "bottom-right",
    });
  });
});
</script>

<template>
  <RouterView />
</template>
