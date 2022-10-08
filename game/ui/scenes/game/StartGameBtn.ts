import { inject, injectable } from "inversify";
import TYPES from "../../../inversify-types";
import EventEmitter from "../../events/EventEmitter";
import { GameplayEvents } from "../../events/events";
import OwnPeerManager from "../../networking/OwnPeerManager";
import WebRTCSansIOClient from "../../networking/WebRTCSansIOClient";
import { StoreType } from "../../store";

@injectable()
class StartGameBtn {
  $btn: HTMLButtonElement;
  ee: EventEmitter;
  store: StoreType;
  io: OwnPeerManager;
  constructor(
    @inject(TYPES.EventEmitter) ee: EventEmitter,
    @inject(TYPES.Store) store: StoreType,
    @inject(TYPES.OwnPeerManager) io: OwnPeerManager
  ) {
    this.ee = ee;
    this.store = store;
    this.io = io;
    this.$btn = document.getElementById("start-play") as HTMLButtonElement;

    this.addListeners();
    this.addClickHandlers();
  }

  addListeners() {
    this.ee.addEventListener(GameplayEvents.AWAITING_PLAY_START, () => {
      if (this.store.get("isHost")) {
        this.render();
      }
    });
  }

  addClickHandlers() {
    this.$btn.addEventListener("click", () => {
      this.io.send(WebRTCSansIOClient.startPlay());
    });
  }

  render() {
    this.$btn.classList.remove("hidden");
  }

  hide() {
    this.$btn.classList.add("hidden");
  }
}

export default StartGameBtn;
