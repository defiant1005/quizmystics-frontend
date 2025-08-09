<script lang="ts" setup>
import { computed, onMounted } from "vue";
import socket from "@/package/config/socket";
import { useRouter } from "vue-router";
import { RouteNames } from "@/router/routes";
import {
  ClientToServerEvents,
  ServerToClientEvents,
} from "@/modules/socket/types";
import { useGameStore } from "@/modules/game/store";
import { useEnterRoomForm } from "@/modules/game/composables/use-enter-room-form";
import { FormInstance } from "element-plus";

defineOptions({
  name: "EnterRoom",
});

const gameStore = useGameStore();

const characterOptions = computed(() => gameStore.characterOptions);

const { enterRoomForm, enterRoomFormRef, rules, convertToUppercase } =
  useEnterRoomForm();

const router = useRouter();

const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) {
    return;
  }

  await formEl.validate((valid) => {
    if (valid) {
      socket.emit(ClientToServerEvents.ENTER_ROOM, {
        name: enterRoomForm.name,
        roomId: enterRoomForm.roomId,
        characterId: enterRoomForm.characterId,
      });
    }
  });
};

onMounted(() => {
  socket.on(ServerToClientEvents.SET_PLAYERS, ({ roomId, name }) => {
    router.replace({
      name: RouteNames.CURRENT_ROOM,
      params: {
        id: roomId,
      },
    });

    gameStore.setRoom(roomId, name);
  });
});
</script>

<template>
  <div class="enter-room">
    <div class="main-container">
      <ElForm
        ref="enterRoomFormRef"
        label-position="top"
        style="max-width: 600px"
        :model="enterRoomForm"
        :rules="rules"
        label-width="auto"
      >
        <ElFormItem label="Имя" prop="name">
          <ElInput
            v-model="enterRoomForm.name"
            type="text"
            clearable
            size="large"
            placeholder="Введите имя"
          />
        </ElFormItem>

        <ElFormItem label="Номер комнаты" prop="roomId">
          <ElInput
            v-model="enterRoomForm.roomId"
            maxlength="4"
            type="text"
            clearable
            size="large"
            placeholder="Введите номер комнаты"
            @input="convertToUppercase"
          />
        </ElFormItem>

        <ElFormItem label="Класс персонажа" prop="characterId">
          <ElSelect
            v-model="enterRoomForm.characterId"
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
          @click="submitForm(enterRoomFormRef)"
        >
          Войти
        </ElButton>
      </ElForm>
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
