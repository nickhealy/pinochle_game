import { inject, injectable } from "inversify";
import { Suit } from "../../../backend/gameplay/Deck";
import TYPES from "../../../inversify-types";
import EventEmitter from "../../events/EventEmitter";
import { GameplayEvents } from "../../events/events";
import OwnPeerManager from "../../networking/OwnPeerManager";
import WebRTCSansIOClient from "../../networking/WebRTCSansIOClient";
import { StoreType } from "../../store";

@injectable()
class TrumpPrompt {
  _$container: HTMLDivElement;
  _ee: EventEmitter;
  _io: OwnPeerManager;
  store: StoreType;
  constructor(
    @inject<EventEmitter>(TYPES.EventEmitter) ee: EventEmitter,
    @inject<OwnPeerManager>(TYPES.OwnPeerManager) io: OwnPeerManager,
    @inject<StoreType>(TYPES.Store) store: StoreType
  ) {
    this._$container = document.getElementById(
      "trump-prompt"
    ) as HTMLDivElement;
    this._ee = ee;
    this._io = io;
    this.store = store;
    this.addClickListeners();
  }
  addClickListeners() {
    const btns = this._$container.querySelectorAll("img");
    btns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const trump = btn.getAttribute("suit") as Suit;
        this.store.set("trump", trump);
        this._ee.emit(GameplayEvents.TRUMP_CHOSEN, {
          trump,
        });
        this._io.send(WebRTCSansIOClient.chooseTrump(trump));
      });
    });
  }
  render() {
    this._$container.classList.remove("hidden");
  }
  hide() {
    this._$container.classList.add("hidden");
  }
}

export default TrumpPrompt;
