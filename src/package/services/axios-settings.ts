import axios from "axios";
import { useMainStore } from "@/stores/main";
import { useCookies } from "vue3-cookies";
export const BASE_URL = import.meta.env.VITE_BACKEND_URL;
const { cookies } = useCookies();

const API = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

API.interceptors.request.use(
  function (config) {
    const token = cookies.get("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

//Список POST запросов, на которые не нужно показывать нотификацию "Успешно"
const postBackApiWithoutNotice = ["api/user/login", "api/game/check-answer"];

API.interceptors.response.use(
  function (response: any) {
    const mainStore = useMainStore();

    if (
      response.config.method !== "get" &&
      !postBackApiWithoutNotice.includes(response.config.url ?? "") &&
      !response.config.notNotice
    ) {
      mainStore.createNotification({
        type: "success",
        description: "Успешно",
      });
    }

    return response;
  },

  function (error) {
    const mainStore = useMainStore();

    if (error.response.status === 500) {
      mainStore.createNotification({
        type: "danger",
        description: "Ошибка сервера",
      });
    } else if (error.response.status === 403 && error.config.method !== "get") {
      mainStore.createNotification({
        type: "danger",
        description: "Отказано в доступе",
      });
    } else {
      mainStore.createNotification({
        type: "danger",
        description: error.response.data.message,
      });
    }
    return Promise.reject(error);
  }
);

export default API;
