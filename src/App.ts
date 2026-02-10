class App {
  #white = "rgba(239, 241,245)";
  #black = "rgba(32,36,37)";

  constructor() {
    this.#assignThemeToStyle();
    this.#initializeEventListeners();
  }

  #initializeEventListeners() {
    matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", this.#onThemeChange);
  }

  #onThemeChange(event: MediaQueryListEvent) {
    this.#colorScheme = event.matches ? "dark" : "light";
    this.#assignThemeToStyle();
  }

  #assignThemeToStyle() {
    this.#themeStyle.innerHTML = `
      :root {
        --black: ${this.#colorScheme === "dark" ? this.#white : this.#black};
        --white: ${this.#colorScheme === "dark" ? this.#black : this.#white};
      }
    `
  }

  get #themeStyle() {
    return document.querySelector<HTMLStyleElement>("style#theme") || (() => {
      const element = document.createElement("style");
      element.setAttribute("type", "text/css");
      element.setAttribute("id", "theme");
      document.head.prepend(element);
      return element
    })()
  }

  get #colorScheme() {
    return (window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) ? "dark" : "light"
  }

  set #colorScheme(colorScheme) {
    this.#colorScheme = colorScheme;
  }
}

export default App;
