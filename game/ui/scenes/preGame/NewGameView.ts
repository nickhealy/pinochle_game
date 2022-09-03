import { inject, injectable } from "inversify";
import TYPES from "../../../inversify-types";
import HTMLView from "../../containers/HTMLContentLayer/HTMLView";

import EventEmitter from "../../events/EventEmitter";
import { PreGameEvents } from "../../events/events";

@injectable()
class NewGameView extends HTMLView {
  $container: HTMLElement;
  $backBtn: HTMLElement;
  _eventEmitter: EventEmitter;
  nameInput: HTMLInputElement | undefined;
  $newGameBtn!: HTMLElement;
  constructor(
    @inject<EventEmitter>(TYPES.EventEmitter) eventEmitter: EventEmitter
  ) {
    super();
    this.$container = document.getElementById(
      "create-game-container"
    ) as HTMLElement;
    this.$backBtn = this.$container.querySelector("#back-btn") as HTMLElement;
    this.$newGameBtn = this.$container.querySelector(
      "#create-game-btn"
    ) as HTMLElement;
    this._eventEmitter = eventEmitter;

    this.addSubscriptions();
    this.addButtonListeners();
  }

  private async createGame() {}

  private addSubscriptions() {
    this._eventEmitter.addEventListener(PreGameEvents.CREATE_GAME, async () => {
      this.$newGameBtn!.innerText = "Loading...";
      await this.createGame();
    });
  }

  private addButtonListeners() {
    this.$backBtn.addEventListener("click", () => {
      this._eventEmitter.emit(PreGameEvents.GO_BACK);
      this.nameInput!.value = "";
    });
    this.$newGameBtn.addEventListener("click", () => {
      this._eventEmitter.emit(PreGameEvents.CREATE_GAME);
    });
  }

  render(): void {
    this.$container.classList.remove("hidden");
  }
  destroy(): void {
    this.$container.classList.add("hidden");
  }
}

export default NewGameView;
