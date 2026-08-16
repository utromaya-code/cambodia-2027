// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

/**
 * Адрес сайта и базовый путь берутся из переменных окружения, чтобы один и тот же
 * код работал и на GitHub Pages (проектный подкаталог), и на собственном домене.
 *
 *   SITE_URL   — полный адрес сайта, попадает в canonical, OG и sitemap.
 *   BASE_PATH  — подкаталог, в котором лежит сайт ('/cambodia-2027' или '/').
 *
 * Значения по умолчанию рассчитаны на GitHub Pages без своего домена.
 * Как подключить домен — см. README, раздел «Домен».
 */
const SITE_URL = process.env.SITE_URL ?? 'https://utromaya-code.github.io';
const BASE_PATH = process.env.BASE_PATH ?? '/cambodia-2027';

export default defineConfig({
  site: SITE_URL,
  base: BASE_PATH,
  trailingSlash: 'ignore',
  integrations: [
    // Политику конфиденциальности в поиск не отдаём: она помечена noindex,
    // и держать её в sitemap было бы противоречием.
    sitemap({ filter: (page) => !page.includes('/privacy') }),
  ],
  build: {
    inlineStylesheets: 'auto',
  },
  image: {
    // Форматы и размеры задаются в компонентах через astro:assets.
    responsiveStyles: true,
  },
  vite: {
    // Tailwind v4 подключается плагином Vite, без tailwind.config.js —
    // токены темы задаются в CSS через @theme (src/styles/global.css).
    plugins: [tailwindcss()],
    build: {
      cssMinify: 'lightningcss',
    },
  },
});
