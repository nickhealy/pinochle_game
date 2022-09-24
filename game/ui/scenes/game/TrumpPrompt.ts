import { inject, injectable } from "inversify";
import TYPES from "../../../inversify-types";
import EventEmitter from "../../events/EventEmitter";
import { GameplayEvents } from "../../events/events";

@injectable()
class TrumpPrompt {
  _$container: HTMLDivElement;
  _ee: EventEmitter;
  constructor(@inject<EventEmitter>(TYPES.EventEmitter) ee: EventEmitter) {
    this._$container = document.getElementById(
      "trump-prompt"
    ) as HTMLDivElement;
    this._ee = ee;
    this.addClickListeners();
  }
  addClickListeners() {
    const btns = this._$container.querySelectorAll("img");
    btns.forEach((btn) => {
      btn.addEventListener("click", () => {
        this._ee.emit(GameplayEvents.TRUMP_CHOSEN, {
          trump: btn.getAttribute("suit"),
        });
      });
    });
  }
  render() {
    this._$container.classList.remove("hidden");
  }
  hide() {
    this._$container.classList.add("hidden");
  }
}

export default TrumpPrompt;
