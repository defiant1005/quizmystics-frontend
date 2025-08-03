<script lang="ts" setup>
import { useRouteParams } from "@vueuse/router";
import { Check, CopyDocument } from "@element-plus/icons-vue";
import { computed, ref } from "vue";
import { ElNotification } from "element-plus";

defineOptions({
  name: "CreateRoom",
});

const isCheck = ref(false);

const currentIcon = computed(() => (isCheck.value ? Check : CopyDocument));

const roomId = useRouteParams("id", "AAAA");

const copyRoomId = async () => {
  isCheck.value = true;

  try {
    await navigator.clipboard.writeText(roomId.value);
    ElNotification({
      title: "Скопировано",
      type: "success",
      position: "bottom-right",
    });
  } catch (error) {
    console.error(error);
  }
};
</script>

<template>
  <div class="create-room">
    <div class="main-container">
      <p>
        Ваша комната:
        <span :class="{ success: isCheck }">
          {{ roomId }}
          <ElIcon @click="copyRoomId">
            <component :is="currentIcon" />
          </ElIcon>
        </span>
      </p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.create-room {
  .main-container {
    > p {
      display: flex;
      gap: 4px;
      align-items: center;

      @include body-M;

      > span {
        display: flex;
        gap: 4px;
        align-items: center;
      }

      .success {
        color: rgb(133 206 97);
      }
    }
  }
}
</style>
