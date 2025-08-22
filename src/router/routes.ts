import { RouteRecordRaw } from "vue-router";

export enum RouteNames {
  MAIN_LAYOUT = "MainLayout",
  HOME_VIEW = "HomeView",
  NOT_FOUND = "NotFound",
  CREATE_ROOM = "CreateRoom",
  CURRENT_ROOM = "CurrentRoom",
  ENTER_ROOM = "EnterRoom",
  CHOOSING_CATEGORY = "ChoosingCategory",
  GAME_QUESTION_PAGE = "GameQuestionPage",
  SPELL_PAGE = "SpellPage",
  CHOOSING_VICTIM_PAGE = "ChoosingVictimPage",
  QUESTION_PAGE = "QuestionPage",
}

export const RoutePaths: Record<RouteNames, string> = {
  [RouteNames.MAIN_LAYOUT]: "/",
  [RouteNames.HOME_VIEW]: "",
  [RouteNames.CREATE_ROOM]: "/create-room",
  [RouteNames.CURRENT_ROOM]: "/room/:id",
  [RouteNames.ENTER_ROOM]: "/enter-room",
  [RouteNames.CHOOSING_CATEGORY]: "/choosing-category",
  [RouteNames.GAME_QUESTION_PAGE]: "/game-question",
  [RouteNames.SPELL_PAGE]: "/spell-page",
  [RouteNames.CHOOSING_VICTIM_PAGE]: "/choosing-victim-page",
  [RouteNames.QUESTION_PAGE]: "/question-page",
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
        component: () => import("@/views/game/ChoosingCategory.vue"),
      },
      {
        path: RoutePaths.GameQuestionPage,
        name: RouteNames.GAME_QUESTION_PAGE,
        component: () => import("@/views/game/GameQuestionPage.vue"),
      },
      {
        path: RoutePaths.SpellPage,
        name: RouteNames.SPELL_PAGE,
        component: () => import("@/views/game/SpellPage.vue"),
      },
      {
        path: RoutePaths.ChoosingVictimPage,
        name: RouteNames.CHOOSING_VICTIM_PAGE,
        component: () => import("@/views/game/ChoosingVictimPage.vue"),
      },
      {
        path: RoutePaths.QuestionPage,
        name: RouteNames.QUESTION_PAGE,
        component: () => import("@/views/game/QuestionPage.vue"),
      },
    ],
  },
  {
    path: RoutePaths.NotFound,
    name: RouteNames.NOT_FOUND,
    component: () => import("@/views/NotFoundPage.vue"),
  },
];
