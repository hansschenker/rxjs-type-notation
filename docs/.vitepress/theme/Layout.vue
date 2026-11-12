<script setup>
import DefaultTheme from 'vitepress/theme';
import { withBase } from 'vitepress';
</script>

<template>
  <DefaultTheme.Layout>
    <template #doc-after>
      <aside class="author-footnote" aria-label="Documentation author credit">
        <p><strong>ChatGPT</strong> · Main contributor and co-author</p>
        <p>
          Developed with Hans Schenker.
          <a :href="withBase('/contributors.html')">Contributors and attribution</a>
        </p>
      </aside>
    </template>
  </DefaultTheme.Layout>
</template>
