import { injectable } from "inversify";
import HTMLView from "../../containers/HTMLContentLayer/HTMLView";
import {
  createButton,
  createCenteredFullScreenContainer,
  createInnerContainer,
  createSpacer,
  Spacer,
} from "../../containers/HTMLContentLayer/utils";
import { PreGameUIEvents } from "./PreGame.scene";

@injectable()
class WelcomeView extends HTMLView {
  _container: HTMLDivElement;
  private joinGameBtn!: HTMLButtonElement;
  private createGameBtn!: HTMLButtonElement;
  constructor() {
    super();
    this._container = this.createWelcome();
  }
  get view() {
    return this._container;
  }
  addClickListeners() {
    this.joinGameBtn.addEventListener("click", () =>
      this.dispatch(PreGameUIEvents.JOIN_GAME_PRESSED)
    );
    this.createGameBtn.addEventListener("click", () =>
      this.dispatch(PreGameUIEvents.NEW_GAME_PRESSED)
    );
  }
  createBtns() {
    this.joinGameBtn = this.createBtn("Join Existing Game");
    this.createGameBtn = this.createBtn("Create New Game");
    this.addClickListeners();
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
