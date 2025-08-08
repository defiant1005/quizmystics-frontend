<script lang="ts" setup>
import { useRouter } from "vue-router";
import { RouteNames } from "@/router/routes";

defineOptions({
  name: "HomePage",
});

const router = useRouter();

const createRoom = () => {
  router.push({
    name: RouteNames.CREATE_ROOM,
  });
};

const enterRoom = () => {
  router.push({
    name: RouteNames.ENTER_ROOM,
  });
};
</script>

<template>
  <div class="home-page">
    <div class="main-container">
      <h1>Добро пожаловать в игру Quizmystics!</h1>

      <div class="home-page__list">
        <ElButton size="large" type="success" @click="createRoom">
          Создать комнату
        </ElButton>
        <ElButton size="large" type="primary" @click="enterRoom">
          Войти в комнату
        </ElButton>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.home-page {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100dvh;

  .main-container {
    display: flex;
    flex-direction: column;
    gap: 24px;
    max-width: 500px;

    > h1 {
      text-align: center;

      @include h1;
    }
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;

    &:deep(.el-button) {
      margin: 0 !important;

      @include body-L;
    }
  }
}
</style>
