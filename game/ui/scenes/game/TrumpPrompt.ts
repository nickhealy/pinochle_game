import { injectable } from "inversify";

@injectable()
class TrumpPrompt {
  _$container: HTMLDivElement;
  constructor() {
    this._$container = document.getElementById(
      "trump-prompt"
    ) as HTMLDivElement;
  }
  render() {
    this._$container.classList.remove("hidden");
  }
  hide() {
    this._$container.classList.add("hidden");
  }
}

export default TrumpPrompt;
