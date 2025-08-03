<script lang="ts" setup>
import { computed, defineComponent, onMounted, ref } from "vue";
import { usePostStore } from "@/modules/post-page/store";
import PostCard from "@/modules/post-page/components/PostCard.vue";

defineComponent({
  name: "PostsPage",
});

const postStore = usePostStore();
const posts = computed(() => postStore.posts);
const isLoading = ref(false);

onMounted(async () => {
  try {
    isLoading.value = true;
    await postStore.getPosts();
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div v-if="!isLoading" class="posts-page">
    <PostCard v-for="post in posts" :key="post.id" :post="post" />
  </div>
</template>

<style lang="scss" scoped>
.posts-page {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  height: 100dvh;
  padding: 30px;
}
</style>
