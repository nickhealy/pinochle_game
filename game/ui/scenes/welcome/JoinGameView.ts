import { injectable } from "inversify";
import HTMLView from "../../containers/HTMLContentLayer/HTMLView";
import {
  createButton,
  createCenteredFullScreenContainer,
  createInlineBackButton,
  createInnerContainer,
  createSpacer,
  Spacer,
} from "../../containers/HTMLContentLayer/utils";
import { PreGameUIEvents } from "./PreGame.scene";

@injectable()
class JoinGameView extends HTMLView {
  private _container: HTMLDivElement;

  constructor() {
    super();
    this._container = this.createContainer();
  }
  get view() {
    return this._container;
  }

  createInput() {
    // const input
  }

  createBackButton() {
    const backBtn = createInlineBackButton();
    backBtn.addEventListener("click", () => {
      this.dispatch(PreGameUIEvents.BACK_BTN_PRESSED);
    });
    return backBtn;
  }

  createJoinBtn() {
    const btn = createButton("Join Game");
    btn.setAttribute("disabled", "true");

    return btn;
  }
  createContainer() {
    const container = createCenteredFullScreenContainer();
    const innerContainer = createInnerContainer();
    innerContainer.appendChild(this.createBackButton());
    innerContainer.appendChild(createSpacer(Spacer.medium));
    innerContainer.appendChild(this.createJoinBtn());
    container.appendChild(innerContainer);

    return container;
  }
}

export default JoinGameView;
