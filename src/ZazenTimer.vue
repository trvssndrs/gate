<script setup lang="ts">
import { ref, computed, type Ref } from 'vue'
import { intervalToDuration, addMilliseconds } from 'date-fns'
import { useWakeLock } from '@/composables/useWakeLock'

const bell = new Audio('./bell.wav')
const { request: requestWakeLock, release: releaseWakeLock } = useWakeLock()
const defaultCount = 20 * 60 * 1000
const defaultWait = 15 * 1000

const isPaused = ref(false)
const isCounting = ref(false)
const count = ref(defaultCount)
const countDuration = computed(() => {
  return intervalToDuration({ start: new Date(), end: addMilliseconds(new Date(), count.value) })
})
const isWaiting = ref(false)
const wait = ref(defaultWait)
const waitDuration = computed(() => {
  return intervalToDuration({
    start: new Date(),
    end: addMilliseconds(new Date(), wait.value),
  })
})

const backgroundStyle = computed(() => {
  if (!isCounting.value) return ''

  const percentComplete = 1 - count.value / (20 * 60 * 1000)
  const deg1 = percentComplete < 0.5 ? 90 : -90
  const deg2 = 360 * percentComplete - 90
  const color1 = percentComplete < 0.5 ? 'black' : 'white'
  const color2 = 'black'

  return `linear-gradient(${deg1}deg, var(--${color1}) 50%, transparent 50%),linear-gradient(${deg2}deg, var(--${color2}) 50%, transparent 50%)`
})

const handleCounterClick = async () => {
  if (isWaiting.value || isCounting.value) {
    isPaused.value = !isPaused.value

    if (isPaused.value) {
      bell.pause()
    }

    return
  }

  await down(wait, isWaiting)
  requestWakeLock()
  bell.play()
  await down(count, isCounting)
  reset()
}

const handleResetClick = (e: MouseEvent) => {
  reset()
  e.stopPropagation()
}

const reset = () => {
  releaseWakeLock()
  isCounting.value = false
  isWaiting.value = false
  isPaused.value = false
  count.value = defaultCount
  wait.value = defaultWait
  bell.load()
}

const down = async (countRef: Ref<number>, isCountingRef: Ref<boolean>) =>
  new Promise((resolve) => {
    isCountingRef.value = true

    const _down = () => {
      if (!isCountingRef.value) return

      if (countRef.value > 0) {
        return setTimeout(() => {
          if (!isPaused.value) {
            countRef.value -= 4
          }

          _down()
        }, 4)
      }

      isCountingRef.value = false
      resolve(true)
    }

    _down()
  })
</script>

<template>
  <div class="zazen-timer" @click="handleCounterClick">
    <div class="zazen-timer__start" :style="{ background: backgroundStyle }"></div>
    <div v-if="isCounting" class="zazen-timer__count">{{ countDuration.minutes }}</div>
    <div v-if="isWaiting" class="zazen-timer__wait">{{ waitDuration.seconds }}</div>
    <div v-if="isPaused" class="zazen-timer__reset" @click="handleResetClick"></div>
  </div>
</template>

<style scoped>
.zazen-timer {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.zazen-timer__start {
  border: none;
  margin: 0;
  padding: 0;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 12.5rem;
  height: 12.5rem;
  border-radius: 100%;
  cursor: pointer;
  background:
    linear-gradient(90deg, var(--black) 50%, transparent 50%),
    linear-gradient(-90deg, var(--black) 50%, transparent 50%);
}

.zazen-timer__start:after {
  content: '';
  display: block;
  position: relative;
  width: 11.5rem;
  height: 11.5rem;
  border-radius: 100%;
  background-color: var(--white);
}

.zazen-timer__count,
.zazen-timer__wait {
  position: absolute;
  bottom: 0;
  z-index: 1;
  font-size: 2rem;
  width: 100%;
  text-align: center;
  font-weight: bold;
  color: var(--black);
  transform: translateY(-7rem);
}

.zazen-timer__reset {
  position: absolute;
  margin-top: 4rem;
  width: 2rem;
  height: 2rem;
  border-radius: 100%;
  background-color: var(--white);
  border: 0.25rem solid var(--black);
  cursor: pointer;
}
</style>
