import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "@/App.vue";
import router from "@/router";
import "@/scss/index.scss";
import "@packages/component-library/style.css";
import "@packages/icon-library/style.css";
import "@packages/color-tokens/style.css";
import "@packages/fonts-library/style.css";

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.mount("#app");
