import { inject, injectable } from "inversify";
import TYPES from "../../../inversify-types";
import HTMLView from "../../HTMLContentLayer/HTMLView";

import EventEmitter from "../../events/EventEmitter";
import { PreGameEvents } from "../../events/events";
import ErrorComponent from "../ErrorComponent";
import OwnPeerManager from "../../networking/OwnPeerManager";
import HostPeerManager from "../../networking/HostPeerManager";
import { createRoom, joinRoom } from "../../networking/requests";
import EventSourceManager from "../../networking/EventSourceManager";

@injectable()
class NewGameView extends HTMLView {
  $container: HTMLElement;
  $backBtn: HTMLElement;
  _error: ErrorComponent;
  _eventEmitter: EventEmitter;
  ownPeerManager: OwnPeerManager;
  hostPeerManager: HostPeerManager;
  eventSourceManager: EventSourceManager;
  $nameInput: HTMLInputElement;
  $newGameBtn!: HTMLElement;
  constructor(
    @inject<EventEmitter>(TYPES.EventEmitter) eventEmitter: EventEmitter,
    @inject<ErrorComponent>(TYPES.ErrorComponent) error: ErrorComponent,
    @inject<OwnPeerManager>(TYPES.OwnPeerManager)
    ownPeerManager: OwnPeerManager,
    @inject<HostPeerManager>(TYPES.HostPeerManager)
    hostPeerManager: HostPeerManager,
    @inject<EventSourceManager>(TYPES.EventSourceManager)
    eventSourceManager: EventSourceManager
  ) {
    super();
    this.$container = document.getElementById(
      "create-game-container"
    ) as HTMLElement;
    this.$backBtn = this.$container.querySelector("#back-btn") as HTMLElement;
    this.$newGameBtn = this.$container.querySelector(
      "#create-game-btn"
    ) as HTMLElement;
    this.$nameInput = this.$container.querySelector(
      "#name-input"
    ) as HTMLInputElement;
    this._eventEmitter = eventEmitter;

    this._error = error;

    this.ownPeerManager = ownPeerManager;
    this.hostPeerManager = hostPeerManager;
    this.eventSourceManager = eventSourceManager;

    this.addSubscriptions();
    this.addButtonListeners();
  }

  private async createGame() {
    try {
      await this.hostPeerManager.waitForId();
      const ownPeerId = await this.ownPeerManager.waitForId();
      const { room_id: roomId } = await createRoom(ownPeerId);
      await this.eventSourceManager.startListening(roomId);
      await joinRoom(roomId, ownPeerId);
      this._eventEmitter.emit(PreGameEvents.CREATE_GAME_SUCCESS, { roomId });
    } catch (e) {
      this._eventEmitter.emit(PreGameEvents.CREATE_GAME_FAIL, {
        // @ts-expect-error will be custom error class but dgaf atm
        message: e.message,
      });
    }
  }

  private addSubscriptions() {
    this._eventEmitter.addEventListener(PreGameEvents.CREATE_GAME, async () => {
      this.$newGameBtn!.innerText = "Loading...";
      await this.createGame();
    });
    this._eventEmitter.addEventListener(PreGameEvents.CREATE_GAME_FAIL, (e) => {
      // @ts-expect-error will be custom error class but dgaf atm
      this._error.showError(e.detail.message);
      this.$newGameBtn.innerHTML = "Create Game";
    });
  }

  private addButtonListeners() {
    this.$backBtn.addEventListener("click", () => {
      this._eventEmitter.emit(PreGameEvents.GO_BACK);
      this.reset();
    });
    this.$newGameBtn.addEventListener("click", () => {
      this._eventEmitter.emit(PreGameEvents.CREATE_GAME);
    });
  }

  private reset() {
    this.$nameInput.querySelector("input")!.value = "";
    this._error.hide();
  }

  render(): void {
    this.$container.classList.remove("hidden");
  }
  destroy(): void {
    this.$container.classList.add("hidden");
  }
}

export default NewGameView;
