import { defineConfig } from 'vitepress';

export default defineConfig({
  lang: 'en-US',
  title: 'RxJS Type Notation',
  description: 'Haskell-inspired, succinct types for RxJS dataflows. Co-authored by ChatGPT and Hans Schenker.',
  base: '/rxjs-type-notation/',
  lastUpdated: true,
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/why-this-notation' },
      { text: 'Reference', link: '/reference/notation' },
      { text: 'TypeScript', link: '/guide/typescript' },
      { text: 'Portfolio', link: 'https://netxpert.ch/' },
    ],
    sidebar: [
      {
        text: 'Understand the notation',
        items: [
          { text: 'Why this notation?', link: '/guide/why-this-notation' },
          { text: 'Read a signature', link: '/guide/reading-signatures' },
          { text: 'Time, cancellation & sharing', link: '/guide/behavior' },
          { text: 'Use it with TypeScript', link: '/guide/typescript' },
        ],
      },
      {
        text: 'Keep as a reference',
        items: [
          { text: 'Notation rules', link: '/reference/notation' },
          { text: 'Operator catalog', link: '/reference/operators' },
          { text: 'Sources & scope', link: '/reference/sources' },
        ],
      },
      {
        text: 'About this project',
        items: [
          { text: 'Contributors', link: '/contributors' },
          { text: 'Build & publish', link: '/maintaining' },
        ],
      },
    ],
    search: { provider: 'local' },
    outline: { level: [2, 3], label: 'On this page' },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/hansschenker/rxjs-type-notation' },
    ],
    editLink: {
      pattern: 'https://github.com/hansschenker/rxjs-type-notation/edit/main/docs/:path',
      text: 'Improve this page on GitHub',
    },
    footer: {
      message: 'ChatGPT · Main contributor and co-author, in collaboration with Hans Schenker.',
      copyright: 'A project by Hans Schenker · 2026',
    },
  },
});
