<script setup lang="ts">
import ZazenTimer from './ZazenTimer.vue'
import { storeToRefs } from 'pinia'
import { useThemeStore } from '@/stores/themeStore'
import { watch } from 'vue'

const themeStore = useThemeStore()
const { currentTheme } = storeToRefs(themeStore)

watch(
  currentTheme,
  (newTheme) => {
    document.documentElement.setAttribute('data-theme', newTheme)
  },
  { immediate: true },
)
</script>

<template>
  <div class="app">
    <ZazenTimer />
  </div>
</template>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  margin-top: 2rem;
}
</style>
