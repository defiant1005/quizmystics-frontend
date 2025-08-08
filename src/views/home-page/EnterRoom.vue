<script lang="ts" setup>
import { onMounted, ref } from "vue";
import socket from "@/package/config/socket";
import { useRouter } from "vue-router";
import { RouteNames } from "@/router/routes";

defineOptions({
  name: "EnterRoom",
});

const roomNumber = ref("");
const router = useRouter();

const enterRoom = () => {
  if (roomNumber.value.trim().length === 4) {
    socket.emit("enterRoom", {
      roomId: roomNumber.value.trim(),
    });
  }
};

onMounted(() => {
  socket.on("userJoined", ({ roomId, players }) => {
    router.replace({
      name: RouteNames.CURRENT_ROOM,
      params: {
        id: roomId,
      },
    });
  });
});
</script>

<template>
  <div class="enter-room">
    <div class="main-container">
      <form @submit.prevent="enterRoom">
        <ElInput
          v-model="roomNumber"
          maxlength="4"
          type="text"
          clearable
          size="large"
          placeholder="Введите номер комнаты"
          label="№ комнаты"
        />

        <ElButton size="large" type="success" @click="enterRoom">
          Войти
        </ElButton>
      </form>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.enter-room {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100dvh;

  .main-container {
    > form {
      display: flex;
      flex-direction: column;
      gap: 12px;
      width: 100%;
      max-width: 500px;

      .el-button {
        width: 100%;
      }
    }
  }
}
</style>
