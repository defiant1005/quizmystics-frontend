<script lang="ts" setup>
import socket from "@/package/config/socket";
import { onMounted } from "vue";
import { ElNotification } from "element-plus";
import { useRoute, useRouter } from "vue-router";
import { RouteNames } from "@/router/routes";
import { usePlayersStore } from "@/modules/player/store";

const route = useRoute();
const router = useRouter();

const playersStore = usePlayersStore();

onMounted(() => {
  socket.on("error", ({ message, slug }) => {
    ElNotification({
      title: message,
      type: "error",
      position: "bottom-right",
    });

    if (route.name === RouteNames.CURRENT_ROOM) {
      router.replace({
        name: RouteNames.HOME_VIEW,
      });
    }
  });

  socket.on("changePlayersCount", ({ players }) => {
    playersStore.changePlayersCount(players);
  });
});
</script>

<template>
  <RouterView />
</template>
