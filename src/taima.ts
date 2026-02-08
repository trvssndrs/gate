import EventEmitter from "eventemitter3";

type Config = {
  length: number;
};

class Taima extends EventEmitter {
  length: number;
  count: number;
  percentComplete: number = 0;
  paused: boolean = false;

  constructor({ length }: Config) {
    super();
    this.length = length * 60 * 1000;
    this.count = this.length;
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
    this.count = this.length;
    this.emit("reset");
  }

  setLength(length: number) {
    this.length = length * 60 * 1000;
    this.count = this.length;
  }

  #run() {
    if (this.paused) {
      return;
    }

    if (this.count === 0) {
      this.emit("finished");
      this.count = this.length;
      return;
    }

    this.count = this.count - 4;
    this.percentComplete = 1 - this.count / this.length;

    this.emit("tick");

    setTimeout(() => {
      this.#run();
    }, 4);
  }
}

export default Taima;
