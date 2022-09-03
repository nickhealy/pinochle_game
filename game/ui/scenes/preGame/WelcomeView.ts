import { inject, injectable } from "inversify";
import HTMLView from "../../containers/HTMLContentLayer/HTMLView";
import { PreGameEvents } from "../../events/events";
import TYPES from "../../../inversify-types";
import EventEmitter from "../../events/EventEmitter";

@injectable()
class WelcomeView extends HTMLView {
  private _eventEmitter: EventEmitter;
  private $container: HTMLElement;
  private $joinGameBtn: HTMLElement;
  private $createGameBtn: HTMLElement;
  constructor(
    @inject<EventEmitter>(TYPES.EventEmitter) eventEmitter: EventEmitter
  ) {
    super();
    this._eventEmitter = eventEmitter;
    this.$container = document.getElementById(
      "welcome-container"
    ) as HTMLElement;
    this.$joinGameBtn = this.$container.querySelector(
      "#nav-to-join-game-btn"
    ) as HTMLElement;
    this.$createGameBtn = this.$container.querySelector(
      "#nav-to-create-game-btn"
    ) as HTMLElement;

    this.addListeners();
  }

  public render() {
    this.$container.classList.remove("hidden");
  }

  public destroy() {
    this.$container.classList.add("hidden");
  }

  addListeners() {
    this.$joinGameBtn.addEventListener("click", () =>
      this._eventEmitter.emit(PreGameEvents.GO_TO_JOIN_GAME)
    );
    this.$createGameBtn.addEventListener("click", () =>
      this._eventEmitter.emit(PreGameEvents.GO_TO_NEW_GAME)
    );
  }
}

export default WelcomeView;
