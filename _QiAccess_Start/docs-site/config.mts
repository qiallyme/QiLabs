import { defineConfig } from "vitepress";

export default defineConfig({
  title: "QiAccess Docs",
  description: "QiAccess Start operating documentation",
  base: "/docs/",
  outDir: "../.vitepress-dist",
  cleanUrls: true,
  ignoreDeadLinks: true,
  themeConfig: {
    nav: [
      { text: "QiAccess Start", link: "/" },
      { text: "Docs Home", link: "/index" }
    ],
    sidebar: [
      {
        text: "QiAccess Start",
        items: [
          { text: "Home", link: "/index" }
        ]
      }
    ],
    search: {
      provider: "local"
    }
  }
});