import { inject, injectable } from "inversify";
import HTMLView from "../../HTMLContentLayer/HTMLView";
import EventEmitter from "../../events/EventEmitter";
import { PreGameEvents } from "../../events/events";

import TYPES from "../../../inversify-types";
import OwnPeerManager from "../../networking/OwnPeerManager";
import ErrorComponent from "../ErrorComponent";
import { joinRoom } from "../../networking/requests";
import { StoreType } from "../../store";

const JOIN_GAME_TEXT = "Join Game";

@injectable()
class JoinGameView extends HTMLView {
  private _eventEmitter: EventEmitter;
  private _ownPeerManager: OwnPeerManager;
  private store: StoreType;
  private error: ErrorComponent;
  private $container: HTMLElement;
  private $joinBtn: HTMLElement;
  private $codeInputContainer: HTMLElement;
  private $codeInputs: Array<HTMLInputElement>;
  private $backBtn: HTMLElement;
  private $nameInput: HTMLElement;

  constructor(
    @inject<EventEmitter>(TYPES.EventEmitter) eventEmitter: EventEmitter,
    @inject<OwnPeerManager>(TYPES.OwnPeerManager) webRtcManager: OwnPeerManager,
    @inject<ErrorComponent>(TYPES.ErrorComponent) error: ErrorComponent,
    @inject<StoreType>(TYPES.Store) store: StoreType
  ) {
    super();
    this._eventEmitter = eventEmitter;
    this._ownPeerManager = webRtcManager;
    this.store = store;
    this.error = error;
    this.addSubscriptions();

    this.$container = document.getElementById(
      "join-game-container"
    ) as HTMLElement;
    this.$joinBtn = this.$container.querySelector(
      "#join-game-btn"
    ) as HTMLElement;
    this.$codeInputContainer = this.$container.querySelector(
      "#room-code-input"
    ) as HTMLElement;
    this.$codeInputs = Array.from(
      this.$codeInputContainer.querySelectorAll(
        "input"
      ) as NodeListOf<HTMLInputElement>
    );
    this.$backBtn = this.$container.querySelector("#back-btn") as HTMLElement;
    this.$nameInput = this.$container.querySelector(
      "#name-input"
    ) as HTMLInputElement;

    this.addInputListeners();
    this.addButtonListeners();
  }

  async joinGame() {
    const roomId = this.$codeInputs.reduce(
      (acc, curr) => (acc += curr.value),
      ""
    );
    const name = this.$nameInput.querySelector("input")!.value;
    try {
      const ownPeerId = await this._ownPeerManager.waitForId();
      const { room_id: resRoomId } = await joinRoom(roomId, {
        ownPeerId,
        name,
      });
      this.store.set("roomId", resRoomId);
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
      this.$joinBtn.innerText = "Joining...";
      await this.joinGame();
    });
    this._eventEmitter.addEventListener(PreGameEvents.JOIN_GAME_FAIL, (e) => {
      this.$joinBtn.innerText = JOIN_GAME_TEXT;
      // @ts-expect-error will be custom error class but dgaf atm
      this.error.showError(e.detail.message);
    });
    this._eventEmitter.addEventListener(PreGameEvents.GO_BACK, () => {
      this.reset.bind(this)();
      this.$nameInput.querySelector("input")!.value = "";
    });
  }

  addInputListeners() {
    this.$codeInputs.forEach((input, idx) => {
      if (idx !== 0) {
        // clicking on any input focuses on first input
        input.addEventListener("click", () => {
          this.$codeInputs[0].focus();
          this.$joinBtn.classList.add("invisible");
        });
      }

      input.addEventListener("keyup", () => {
        if (input.value === undefined || input.value === null) {
          return;
        }

        if (idx === 3) {
          this.$joinBtn.classList.remove("invisible");
          this.$codeInputs[idx].blur();
        } else {
          this.$codeInputs[idx + 1].focus();
        }
      });

      input.addEventListener("click", () => {
        // this is potentially a questionable choice from product perspective,
        // but it keeps things simple
        this.reset();
      });
    });
  }

  addButtonListeners() {
    this.$backBtn.addEventListener("click", () => {
      this._eventEmitter.emit(PreGameEvents.GO_BACK);
    });

    this.$joinBtn.addEventListener("click", () => {
      this._eventEmitter.emit(PreGameEvents.JOIN_GAME);
    });
  }

  reset() {
    this.$codeInputs.forEach((input) => (input.value = ""));
    this.$joinBtn.classList.add("invisible");
    this.error.hide();
  }

  render(): void {
    this.$container.classList.remove("hidden");
  }

  destroy(): void {
    this.$container.classList.add("hidden");
  }
}

export default JoinGameView;
