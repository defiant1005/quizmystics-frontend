import { RouteRecordRaw } from "vue-router";

export enum RouteNames {
  MAIN_LAYOUT = "MainLayout",
  HOME_VIEW = "HomeView",
  NOT_FOUND = "NotFound",
  CREATE_ROOM = "CreateRoom",
  CURRENT_ROOM = "CurrentRoom",
  ENTER_ROOM = "EnterRoom",
  CHOOSING_CATEGORY = "ChoosingCategory",
}

export const RoutePaths: Record<RouteNames, string> = {
  [RouteNames.MAIN_LAYOUT]: "/",
  [RouteNames.HOME_VIEW]: "",
  [RouteNames.CREATE_ROOM]: "/create-room",
  [RouteNames.CURRENT_ROOM]: "/room/:id",
  [RouteNames.ENTER_ROOM]: "/enter-room",
  [RouteNames.CHOOSING_CATEGORY]: "/choosing-category",
  [RouteNames.NOT_FOUND]: "/:pathMatch(.*)*",
};

export const routes: RouteRecordRaw[] = [
  {
    path: RoutePaths.MainLayout,
    name: RouteNames.MAIN_LAYOUT,
    component: () => import("@/layouts/MainLayout.vue"),
    children: [
      {
        path: RoutePaths.HomeView,
        name: RouteNames.HOME_VIEW,
        component: () => import("@/views/home-page/HomePage.vue"),
      },
      {
        path: RoutePaths.CreateRoom,
        name: RouteNames.CREATE_ROOM,
        component: () => import("@/views/home-page/CreateRoom.vue"),
      },
      {
        path: RoutePaths.CurrentRoom,
        name: RouteNames.CURRENT_ROOM,
        component: () => import("@/views/home-page/CurrentRoom.vue"),
        beforeEnter(to) {
          if (to.params.id.length !== 4) {
            return {
              name: RouteNames.HOME_VIEW,
            };
          }
        },
      },
      {
        path: RoutePaths.EnterRoom,
        name: RouteNames.ENTER_ROOM,
        component: () => import("@/views/home-page/EnterRoom.vue"),
      },
      {
        path: RoutePaths.ChoosingCategory,
        name: RouteNames.CHOOSING_CATEGORY,
        component: () => import("@/views/ChoosingCategory.vue"),
      },
    ],
  },
  {
    path: RoutePaths.NotFound,
    name: RouteNames.NOT_FOUND,
    component: () => import("@/views/NotFoundPage.vue"),
  },
];
