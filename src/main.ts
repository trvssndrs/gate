import { addMilliseconds, intervalToDuration } from "date-fns";
import Taima from "./taima";
import "./style.css";

const settings = document.getElementById("settings");
const settingsLength =
  document.querySelector<HTMLInputElement>("#settingsLength");
const length = parseInt(settingsLength?.value ?? "20");
const taima = new Taima({ length });
const taimaStart = document.getElementById("taimaStart");
const taimaReset = document.getElementById("taimaReset");
const taimaBell = document.querySelector("audio");

const theme = (() => {
  const isDark =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  return isDark ? "dark" : "light";
})();
const style = document.createElement("style");
style.setAttribute("type", "text/css");
style.setAttribute("id", "theme");
assignThemeToStyle(theme, style);

document.head.prepend(style);
document.body.classList.remove("is-loading");

function assignThemeToStyle(
  theme: "dark" | "light",
  styleElement: HTMLStyleElement,
) {
  const white = "rgba(239, 241,245)";
  const black = "rgba(32,36,37)";
  styleElement.innerHTML = `
    :root {
      --black: ${theme === "dark" ? white : black};
      --white: ${theme === "dark" ? black : white};
    }
  `;
}

function handleThemeChange(event: MediaQueryListEvent) {
  const theme = event.matches ? "dark" : "light";
  const style = document.head.querySelector("#theme");
  if (!style) return;
  assignThemeToStyle(theme, style as HTMLStyleElement);
}

function handleSubsequentTaimaStartClicks() {
  taima.pause();
}

function handleTaimaResetClick() {
  taima.reset();
}

function handleFirstTaimaStartClick() {
  taima.start();
  taimaStart?.removeEventListener("click", handleFirstTaimaStartClick);
  taimaStart?.addEventListener("click", handleSubsequentTaimaStartClicks);
}

function handleSettingsLengthChange(e: Event) {
  taima.setLength(parseInt((e.target as HTMLInputElement)?.value));
}

function handleTaimaReset() {
  if (!taimaStart || !settings || !taimaReset) return;

  settings.classList.remove("settings--hidden");
  taimaReset.classList.remove("taima__reset--active");
  taimaStart.style.setProperty("background", "");
  taimaStart.innerHTML = "";
  taimaStart.removeEventListener("click", handleSubsequentTaimaStartClicks);
  taimaStart.addEventListener("click", handleFirstTaimaStartClick);
}

function handleTaimaFinished() {
  handleTaimaReset();
  taimaBell?.play();
}

function handleTaimaStart() {
  settings?.classList.add("settings--hidden");
  taimaBell?.play();
}

function handleTaimaTick() {
  if (!taimaStart) return;

  const { minutes, seconds } = intervalToDuration({
    start: new Date(),
    end: addMilliseconds(new Date(), taima.count),
  });
  const value = (minutes ? minutes : seconds)?.toString() ?? "";
  const deg1 = taima.percentComplete < 0.5 ? 90 : -90;
  const deg2 = 360 * taima.percentComplete - 90;
  const color1 = taima.percentComplete < 0.5 ? "black" : "white";
  const color2 = "black";

  taimaStart.style.background = `linear-gradient(${deg1}deg, var(--${color1}) 50%, transparent 50%),linear-gradient(${deg2}deg, var(--${color2}) 50%, transparent 50%)`;
  taimaStart.innerHTML = `<span class="taima__count">${value}</span>`;
}

function handleTaimaPaused() {
  taimaBell?.pause();
  taimaReset?.classList.add("taima__reset--active");
}

function handleTaimaUnpaused() {
  taimaReset?.classList.remove("taima__reset--active");
}

matchMedia("(prefers-color-scheme: dark)").addEventListener(
  "change",
  handleThemeChange,
);
taimaReset?.addEventListener("click", handleTaimaResetClick);
taimaStart?.addEventListener("click", handleFirstTaimaStartClick);
settingsLength?.addEventListener("change", handleSettingsLengthChange);

taima.on("start", handleTaimaStart);
taima.on("tick", handleTaimaTick);
taima.on("paused", handleTaimaPaused);
taima.on("unpaused", handleTaimaUnpaused);
taima.on("reset", handleTaimaReset);
taima.on("finished", handleTaimaFinished);
