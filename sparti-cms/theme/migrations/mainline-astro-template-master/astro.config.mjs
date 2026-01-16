// @ts-check
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import node from "@astrojs/node";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  site: "https://example.com",
  base: "/theme/master",
  integrations: [mdx(), sitemap(), react()],
  output: "server",
  adapter: node({ mode: "middleware" }),
  vite: {
    plugins: [tailwindcss()],
  },
});