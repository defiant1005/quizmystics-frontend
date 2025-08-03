import { RouteRecordRaw } from "vue-router";

export enum RouteNames {
  MAIN_LAYOUT = "MainLayout",
  HOME_VIEW = "HomeView",
  NOT_FOUND = "NotFound",
  CREATE_ROOM = "CreateRoom",
}

export const RoutePaths: Record<RouteNames, string> = {
  [RouteNames.MAIN_LAYOUT]: "/",
  [RouteNames.HOME_VIEW]: "",
  [RouteNames.CREATE_ROOM]: "/room/:id",
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
        beforeEnter(to) {
          if (to.params.id.length !== 4) {
            return {
              name: RouteNames.HOME_VIEW,
            };
          }
        },
      },
    ],
  },
  {
    path: RoutePaths.NotFound,
    name: RouteNames.NOT_FOUND,
    component: () => import("@/views/NotFoundPage.vue"),
  },
];
