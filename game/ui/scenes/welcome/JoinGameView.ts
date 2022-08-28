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
  private joinBtn!: HTMLButtonElement;
  private inputs!: Array<HTMLInputElement>;

  constructor() {
    super();
    this._container = this.createContainer();
  }
  get view() {
    return this._container;
  }

  createCharacterInput() {
    const input = document.createElement("input");
    input.maxLength = 1;
    input.style.width = "20px";
    input.style.height = "20px";
    input.style.textAlign = "center";
    return input;
  }

  addInputListeners() {
    this.inputs.forEach((input, idx) => {
      if (idx !== 0) {
        // clicking on any input focuses on first input
        input.addEventListener("click", () => {
          this.inputs[0].focus();
          this.joinBtn.style.visibility = "hidden";
        });
      }

      input.addEventListener("keyup", () => {
        if (input.value === undefined || input.value === null) {
          return;
        }

        if (idx === 3) {
          this.joinBtn.style.visibility = "visible";
          this.inputs[idx].blur();
        } else {
          this.inputs[idx + 1].focus();
        }
      });

      input.addEventListener("click", () => {
        // this is potentially a questionable choice from product perspective,
        // but it keeps things simple
        this.clearInputs();
      });
    });
  }

  clearInputs() {
    this.inputs.forEach((input) => (input.value = ""));
    this.joinBtn.style.visibility = "hidden";
  }

  createInput() {
    const container = document.createElement("div");
    const form = document.createElement("form");
    this.inputs = [
      this.createCharacterInput(),
      this.createCharacterInput(),
      this.createCharacterInput(),
      this.createCharacterInput(),
    ];
    this.addInputListeners();
    form.append(...this.inputs);
    container.appendChild(form);
    return container;
  }

  createBackButton() {
    const backBtn = createInlineBackButton();
    backBtn.addEventListener("click", () => {
      this.dispatch(PreGameUIEvents.BACK_BTN_PRESSED);
      this.clearInputs();
    });
    return backBtn;
  }

  createJoinBtn() {
    const btn = createButton("Join Game");
    btn.style.visibility = "hidden";
    this.joinBtn = btn;
    return btn;
  }

  createCodePrompt() {
    const promptEl = document.createElement("p");
    promptEl.style.color = "white";
    promptEl.innerText = "Enter Room Code";
    return promptEl;
  }
  createContainer() {
    const container = createCenteredFullScreenContainer();
    const innerContainer = createInnerContainer();
    innerContainer.appendChild(this.createBackButton());
    innerContainer.appendChild(this.createCodePrompt());
    innerContainer.appendChild(this.createInput());
    innerContainer.appendChild(createSpacer(Spacer.medium));
    innerContainer.appendChild(this.createJoinBtn());
    container.appendChild(innerContainer);

    return container;
  }
}

export default JoinGameView;
