import { inject, injectable } from "inversify";
import TYPES from "../../../inversify-types";
import EventEmitter from "../../events/EventEmitter";
import { GameplayEvents } from "../../events/events";

@injectable()
class TrumpContainer {
  _$container: HTMLDivElement;
  $trumpImg: HTMLImageElement;
  ee: EventEmitter;
  constructor(@inject<EventEmitter>(TYPES.EventEmitter) ee: EventEmitter) {
    this._$container = document.getElementById(
      "trump-container"
    ) as HTMLDivElement;
    this.$trumpImg = this._$container.querySelector("img") as HTMLImageElement;
    this.ee = ee;

    this.addSubscriptions();
  }
  addSubscriptions() {
    this.ee.addEventListener(GameplayEvents.TRUMP_CHOSEN, (event) => {
      // @ts-ignore
      const { trump } = event.detail;
      this.$trumpImg.src = `/suits/${trump}.png`;
      this.render();
    });
  }
  render() {
    this._$container.classList.remove("hidden");
  }
  hide() {
    this._$container.classList.add("hidden");
  }
}

export default TrumpContainer;
