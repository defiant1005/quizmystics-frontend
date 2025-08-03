<script lang="ts" setup>
import { defineComponent, PropType } from "vue";
import { IPost } from "@/modules/post-page/types";

defineProps({
  post: {
    type: Object as PropType<IPost>,
    required: true,
  },
});

defineComponent({
  name: "PostCard",
});
</script>

<template>
  <div class="post-card">{{ post.body }}</div>
</template>

<style lang="scss" scoped>
.post-card {
  width: 300px;
  height: 200px;

  @include caption;
}
</style>
