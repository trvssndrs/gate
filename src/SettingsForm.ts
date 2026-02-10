import EventEmitter from "eventemitter3";

class SettingsForm extends EventEmitter {
  constructor() {
    super();
    this.#initializeEventListeners();
  }

  toCounterSettings() {
    return {
      minutes: parseInt(this.#minutes?.value ?? "20"),
    }
  }

  #initializeEventListeners() {
    this.#form?.addEventListener('change', () => {
      this.emit("change", this);
    })
  }

  get #form() {
    return document.querySelector<HTMLFormElement>("#settings");
  }

  get #minutes() {
    return this.#form?.elements.namedItem("length") as HTMLInputElement | null;
  }
}

export default SettingsForm;
