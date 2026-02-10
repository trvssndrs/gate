import "./style.css";
import App from "./App";
import SettingsForm from "./SettingsForm";
import Counter from "./Counter";
import CounterForm from "./CounterForm";

new App();
const settings = new SettingsForm();
const counter = new Counter(settings);
new CounterForm(counter);

