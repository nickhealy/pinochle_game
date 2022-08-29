import { EventEmitter } from "@pixi/utils";
import { inject, injectable } from "inversify";
import { INTERNAL_FORMAT_TO_BYTES_PER_PIXEL } from "pixi.js";
import { init } from "xstate/lib/actionTypes";
import HTMLView from "../../containers/HTMLContentLayer/HTMLView";
import {
  createButton,
  createCenteredFullScreenContainer,
  createInnerContainer,
  createSpacer,
  Spacer,
} from "../../containers/HTMLContentLayer/utils";
import { PreGameEvents } from "../../events/events";
import TYPES from "../../types/main";

@injectable()
class WelcomeView extends HTMLView {
  private _container: HTMLDivElement;
  private _eventEmitter: EventEmitter;
  private joinGameBtn!: HTMLButtonElement;
  private createGameBtn!: HTMLButtonElement;
  constructor(
    @inject<EventEmitter>(TYPES.EventEmitter) eventEmitter: EventEmitter
  ) {
    super();
    this._eventEmitter = eventEmitter;
    this._container = this.createWelcome();
  }
  get view() {
    return this._container;
  }
  createBtns() {
    this.joinGameBtn = this.createBtn("Join Existing Game");
    this.createGameBtn = this.createBtn("Create New Game");
    this.joinGameBtn.addEventListener("click", () =>
      this._eventEmitter.emit(PreGameEvents.GO_TO_JOIN_GAME)
    );
    this.createGameBtn.addEventListener("click", () =>
      this._eventEmitter.emit(PreGameEvents.GO_TO_NEW_GAME)
    );
  }
  createBtn(text: string) {
    const btn = createButton(text);
    return btn;
  }

  createWelcome() {
    this.createBtns();
    const container = createCenteredFullScreenContainer();
    const btnContainer = createInnerContainer();
    btnContainer.appendChild(this.joinGameBtn);
    btnContainer.appendChild(createSpacer(Spacer.medium));
    btnContainer.appendChild(this.createGameBtn);
    container.appendChild(btnContainer);
    return container;
  }
}

export default WelcomeView;
