import { injectable } from "inversify";
import HTMLView from "../../containers/HTMLContentLayer/HTMLView";
import {
  createButton,
  createCenteredContainer,
  createSpacer,
  Spacer,
} from "../../containers/HTMLContentLayer/utils";

@injectable()
class WelcomeView implements HTMLView {
  _container: HTMLDivElement;
  private joinGameBtn!: HTMLButtonElement;
  private createGameBtn!: HTMLButtonElement;
  constructor() {
    this._container = this.createWelcome();
  }
  get view() {
    return this._container;
  }
  addClickListeners() {
    this.joinGameBtn!.addEventListener("click", () =>
      console.log("joinGame clicked")
    );
    this.createGameBtn!.addEventListener("click", () =>
      console.log("createGame clicked")
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
  createBtnContainer() {
    const container = document.createElement("div");
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.flexDirection = "column";
    return container;
  }
  createWelcome() {
    this.createBtns();
    const container = createCenteredContainer();
    const btnContainer = this.createBtnContainer();
    btnContainer.appendChild(this.joinGameBtn);
    btnContainer.appendChild(createSpacer(Spacer.medium));
    btnContainer.appendChild(this.createGameBtn);
    container.appendChild(btnContainer);
    return container;
  }
}

export default WelcomeView;
