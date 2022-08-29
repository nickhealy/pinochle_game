import { inject, injectable } from "inversify";
import HTMLView from "../../containers/HTMLContentLayer/HTMLView";
import {
  createButton,
  createCenteredFullScreenContainer,
  createInlineBackButton,
  createInnerContainer,
  createSpacer,
  Spacer,
} from "../../containers/HTMLContentLayer/utils";
import EventEmitter from "../../events/EventEmitter";
import { PreGameEvents } from "../../events/events";

import TYPES from "../../types/main";
import OwnPeerManager from "../../webrtc/OwnPeerManager";

const JOIN_GAME_TEXT = "Join Game";

@injectable()
class JoinGameView extends HTMLView {
  private _container: HTMLDivElement;
  private _eventEmitter: EventEmitter;
  private _ownPeerManager: OwnPeerManager;
  private joinBtn!: HTMLButtonElement;
  private joinError!: HTMLParagraphElement;
  private nameInput!: HTMLInputElement;
  private inputs!: Array<HTMLInputElement>;

  constructor(
    @inject<EventEmitter>(TYPES.EventEmitter) eventEmitter: EventEmitter,
    @inject<OwnPeerManager>(TYPES.OwnPeerManager) webRtcManager: OwnPeerManager
  ) {
    super();
    this._eventEmitter = eventEmitter;
    this._ownPeerManager = webRtcManager;
    this._container = this.createContainer();
    this.addSubscriptions();
  }
  get view() {
    return this._container;
  }

  async joinGame() {
    const roomId = this.inputs.reduce((acc, curr) => (acc += curr.value), "");
    try {
      const ownPeerId = await this._ownPeerManager.waitForId();
      const res: Response = await fetch(`/rooms/${roomId}/join`, {
        method: "POST",
        redirect: "follow",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          peer_id: ownPeerId,
        }),
      });
      if (res.status !== 200) {
        throw new Error("there was an error");
      }
      this._eventEmitter.emit(PreGameEvents.JOIN_GAME_SUCCESS);
    } catch (e) {
      this._eventEmitter.emit(PreGameEvents.JOIN_GAME_FAIL, {
        // @ts-expect-error will be custom error class but dgaf atm
        message: e.message,
      });
    }
  }

  private addSubscriptions() {
    this._eventEmitter.addEventListener(PreGameEvents.JOIN_GAME, async () => {
      this.joinBtn.innerText = "Joining...";
      await this.joinGame();
    });
    this._eventEmitter.addEventListener(PreGameEvents.JOIN_GAME_FAIL, (e) => {
      this.joinBtn.innerText = JOIN_GAME_TEXT;
      // @ts-expect-error will be custom error class but dgaf atm
      this.joinError.innerText = e.detail.message;
    });
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
        this.reset();
      });
    });
  }

  reset() {
    this.inputs.forEach((input) => (input.value = ""));
    this.joinBtn.style.visibility = "hidden";
    this.joinError.innerText = "";
  }

  createCodeInput() {
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

  createNameInput() {
    this.nameInput = document.createElement("input");
    this.nameInput.type = "text";
    this.nameInput.style.textAlign = "center";
    return this.nameInput;
  }

  createPrompt(text: string) {
    const promptEl = document.createElement("p");
    promptEl.style.color = "white";
    promptEl.innerText = text;
    return promptEl;
  }

  createBackButton() {
    const backBtn = createInlineBackButton();
    backBtn.addEventListener("click", () => {
      this._eventEmitter.emit(PreGameEvents.GO_BACK);
      this.reset();
      this.nameInput.value = "";
    });
    return backBtn;
  }

  createJoinBtn() {
    const container = document.createElement("div");
    container.style.width = "100%";
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";

    this.joinError = document.createElement("p");
    this.joinError.style.color = "white";
    this.joinError.innerText = "";

    this.joinBtn = createButton(JOIN_GAME_TEXT);
    this.joinBtn.addEventListener("click", () => {
      this._eventEmitter.emit(PreGameEvents.JOIN_GAME);
    });
    this.joinBtn.style.visibility = "hidden";
    container.append(this.joinBtn, this.joinError);
    return container;
  }

  createContainer() {
    const container = createCenteredFullScreenContainer();
    const innerContainer = createInnerContainer();
    innerContainer.appendChild(this.createBackButton());
    innerContainer.appendChild(this.createPrompt("Enter Name"));
    innerContainer.appendChild(this.createNameInput());
    innerContainer.appendChild(this.createPrompt("Enter Room Code"));
    innerContainer.appendChild(this.createCodeInput());
    innerContainer.appendChild(createSpacer(Spacer.medium));
    innerContainer.appendChild(this.createJoinBtn());
    container.appendChild(innerContainer);

    return container;
  }
}

export default JoinGameView;
