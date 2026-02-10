import type Counter from "./Counter";
import { addMilliseconds, intervalToDuration } from "date-fns";

class CounterForm {
  #counter: Counter;
  #wakeLock: WakeLockSentinel | null = null;

  constructor(counter: Counter) {
    this.#counter = counter;
    this.#initializeEventListeners();
  }

  #onResetClick = () => {
    this.#counter.reset();
  }

  #onFirstStartClick = (
    event: Event,
    countDown: number | undefined = 20,
  ) => {
    if (this.#startButton && countDown > 0) {
      this.#startButton.innerHTML =
        `<span class="counter__count">${countDown.toString()}</span>`;

      setTimeout(() => {
        this.#onFirstStartClick(event, countDown - 1);
      }, 1000);

      return;
    }

    this.#counter.start();

    this.#startButton
      ?.removeEventListener("click", this.#onFirstStartClick);
    this.#startButton
      ?.addEventListener("click", this.#onSubsequentStartClicks);

    navigator.wakeLock
      .request("screen")
      .then((sentinel) => {
        this.#wakeLock = sentinel
      })
      .catch((e) => console.log(e));
  }

  #onSubsequentStartClicks = () => {
    this.#counter.pause();
  }

  #onReset = () => {
    if (!this.#startButton || !this.#resetButton) return;

    this.#wakeLock?.release();
    this.#resetButton.classList.remove("counter__reset--active");
    this.#startButton.style.setProperty("background", "");
    this.#startButton.innerHTML = "";
    this.#startButton
      .removeEventListener("click", this.#onSubsequentStartClicks);
    this.#startButton
      .addEventListener("click", this.#onFirstStartClick);
  }

  #onStart = () => {
    this.#bell?.play();
  }

  #onFinished = () => {
    this.#onReset();
    this.#bell?.play();
  }

  #onTick = () => {
    if (!this.#startButton) return;

    const { minutes, seconds } = intervalToDuration({
      start: new Date(),
      end: addMilliseconds(new Date(), this.#counter.count),
    });
    const value = (minutes ? minutes + 1 : seconds)?.toString() ?? "";
    const deg1 = this.#counter.percentComplete < 0.5 ? 90 : -90;
    const deg2 = 360 * this.#counter.percentComplete - 90;
    const color1 = this.#counter.percentComplete < 0.5 ? "black" : "white";
    const color2 = "black";

    this.#startButton.style.background = `linear-gradient(${deg1}deg, var(--${color1}) 50%, transparent 50%),linear-gradient(${deg2}deg, var(--${color2}) 50%, transparent 50%)`;
    this.#startButton.innerHTML = `<span class="counter__count">${value}</span>`;
  }

  #onPaused = () => {
    this.#bell?.pause();
    this.#resetButton?.classList.add("counter__reset--active");
  }

  #onUnpaused = () => {
    if (this.#bell?.paused) this.#bell.play();
    this.#resetButton?.classList.remove("counter__reset--active");
  }

  #initializeEventListeners() {
    this.#resetButton
      ?.addEventListener("click", this.#onResetClick);
    this.#startButton
      ?.addEventListener("click", this.#onFirstStartClick);
    this.#counter.on("start", this.#onStart);
    this.#counter.on("tick", this.#onTick);
    this.#counter.on("paused", this.#onPaused);
    this.#counter.on("unpaused", this.#onUnpaused);
    this.#counter.on("reset", this.#onReset);
    this.#counter.on("finished", this.#onFinished);
  }

  get #counterForm() {
    return document.querySelector<HTMLFormElement>("#counter");
  }

  get #startButton() {
    return this.#counterForm?.elements
      .namedItem("start") as HTMLButtonElement | null;
  }

  get #resetButton() {
    return this.#counterForm?.elements
      .namedItem("reset") as HTMLButtonElement | null;
  }

  get #bell() {
    return this.#counterForm?.elements
      .namedItem("bell") as HTMLAudioElement | null;
  }
}

export default CounterForm;
