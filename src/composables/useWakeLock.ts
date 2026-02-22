import { ref } from 'vue'

export function useWakeLock() {
  const wakeLock = ref<WakeLockSentinel | null>(null)

  const request = async () => {
    try {
      wakeLock.value = await navigator.wakeLock.request('screen')
    } catch (e) {
      console.log(e)
    }
  }

  const release = () => {
    wakeLock.value?.release()
    wakeLock.value = null
  }

  return { wakeLock, request, release }
}
