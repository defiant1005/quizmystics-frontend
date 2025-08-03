/// <reference types="vite/client" />

declare module "*.vue";

declare module "vite-plugin-eslint" {
  import { Plugin } from "vite";
  export default function eslintPlugin(): Plugin;
}
