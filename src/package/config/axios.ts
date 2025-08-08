import axios from "axios";
import { BASE_URL } from "@/package/constants";

const API = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

API.interceptors.response.use(
  function (config) {
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

API.interceptors.request.use(
  function (config) {
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

export default API;
