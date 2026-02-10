import EventEmitter from "eventemitter3";
import type SettingsForm from "./SettingsForm";

export type CounterSetings = {
  minutes: number;
}

class Counter extends EventEmitter {
  settings: CounterSetings;
  count: number;
  percentComplete: number = 0;
  paused: boolean = false;

  constructor(settings: SettingsForm) {
    super();
    this.settings = settings.toCounterSettings();
    this.count = this.settings.minutes * 60 * 1000;

    settings.on("change", (settings) => {
      this.settings = settings;
      this.reset();
    })
  }

  start() {
    this.emit("start");
    this.#run();
  }

  pause() {
    this.paused = !this.paused;
    this.emit(this.paused ? "paused" : "unpaused");

    if (this.paused) return;

    this.#run();
  }

  reset() {
    this.paused = false;
    this.count = this.settings.minutes;
    this.emit("reset");
  }

  #run() {
    if (this.paused) {
      return;
    }

    if (this.count === 0) {
      this.emit("finished");
      this.count = this.settings.minutes * 60 * 1000;
      return;
    }

    this.count = this.count - 4;
    this.percentComplete = 1 - this.count / (this.settings.minutes * 60 * 1000);

    this.emit("tick");

    setTimeout(() => {
      this.#run();
    }, 4);
  }
}

export default Counter;
