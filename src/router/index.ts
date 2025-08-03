import { createRouter, createWebHistory, Router } from "vue-router";
import { routes } from "@/router/routes";

const router: Router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes,
});

router.beforeEach((to) => {
  // const mainStore = useMainStore(); //pinia указывается тут

  // if (!mainStore.isAuthorized && to.name !== "Authorization") {
  //   return { name: "Authorization" };
  // }

  // @ts-ignore
  document.title = to.meta.title ?? window.document.title;
});

export default router;
