<script lang="ts" setup>
import { defineComponent } from "vue";
import { useRouter } from "vue-router";
import { RouteNames } from "@/router/routes";

defineComponent({
  name: "NotFoundPage",
});

const router = useRouter();

const goHome = () => {
  router.push({ name: RouteNames.HOME_VIEW });
};
</script>

<template>
  <ElResult title="404" sub-title="Страница не найдена">
    <template #icon>
      <ElImage
        src="https://static.vecteezy.com/system/resources/thumbnails/008/568/878/small_2x/website-page-not-found-error-404-oops-worried-robot-character-peeking-out-of-outer-space-site-crash-on-technical-work-web-design-template-with-chatbot-mascot-cartoon-online-bot-assistance-failure-vector.jpg"
      />
    </template>
    <template #extra>
      <ElButton type="primary" @click="goHome">Домой</ElButton>
    </template>
  </ElResult>
</template>

<style lang="scss" scoped>
.not-found-page {
}
</style>
