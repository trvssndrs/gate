import { defineStore } from 'pinia'
import { ref } from 'vue'

const getSystemTheme = () =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'

export const useThemeStore = defineStore('theme', () => {
  const currentTheme = ref(localStorage.getItem('theme') ?? getSystemTheme())

  const setTheme = (theme: string) => {
    currentTheme.value = theme
    localStorage.setItem('theme', theme)
  }

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      currentTheme.value = e.matches ? 'dark' : 'light'
    }
  })

  return { currentTheme, setTheme }
})
