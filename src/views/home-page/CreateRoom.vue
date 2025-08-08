<script lang="ts" setup>
import { useCreateRoomForm } from "@/modules/game/composables/use-create-room-form";
import { useGameStore } from "@/modules/game/store";
import { computed, onMounted } from "vue";
import { FormInstance } from "element-plus";
import socket from "@/package/config/socket";
import {
  ClientToServerEvents,
  ServerToClientEvents,
} from "@/modules/socket/types";
import { generateRandomUppercaseString } from "@/package/helpers/generate-random-uppercase-string";
import { useRouter } from "vue-router";
import { RouteNames } from "@/router/routes";

defineOptions({
  name: "CreateRoom",
});

const { createRoomFormRef, createRoomForm, rules } = useCreateRoomForm();

const gameStore = useGameStore();
const router = useRouter();

const characterOptions = computed(() => gameStore.characterOptions);

const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) {
    return;
  }

  await formEl.validate((valid) => {
    if (valid) {
      const roomId = generateRandomUppercaseString();

      socket.emit(ClientToServerEvents.CREATE_ROOM, {
        name: createRoomForm.name,
        roomId: roomId,
        characterId: createRoomForm.characterId,
      });
    }
  });
};

onMounted(() => {
  socket.on(ServerToClientEvents.ROOM_CREATED, ({ roomId, socketId }) => {
    router.push({
      name: RouteNames.CURRENT_ROOM,
      params: { id: roomId },
    });

    gameStore.setRoom(roomId, socketId);
  });
});
</script>

<template>
  <div class="create-room">
    <div class="main-container">
      <ElForm
        ref="createRoomFormRef"
        label-position="top"
        style="max-width: 600px"
        :model="createRoomForm"
        :rules="rules"
        label-width="auto"
      >
        <ElFormItem label="Имя" prop="name">
          <ElInput
            v-model="createRoomForm.name"
            type="text"
            clearable
            size="large"
            placeholder="Введите имя"
          />
        </ElFormItem>

        <ElFormItem label="Класс персонажа" prop="characterId">
          <ElSelect
            v-model="createRoomForm.characterId"
            placeholder="Выберите класс персонажа"
            size="large"
          >
            <ElOption
              v-for="character in characterOptions"
              :key="character.value"
              :label="character.label"
              :value="character.value"
            />
          </ElSelect>
        </ElFormItem>

        <ElButton
          size="large"
          type="success"
          @click="submitForm(createRoomFormRef)"
        >
          Войти
        </ElButton>
      </ElForm>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.create-room {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100dvh;

  .main-container {
    display: flex;
    align-items: center;
    justify-content: center;

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
