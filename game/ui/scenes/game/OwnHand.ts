import { inject, injectable } from "inversify";
import TYPES from "../../../inversify-types";
import EventEmitter from "../../events/EventEmitter";
import { GameplayEvents } from "../../events/events";
import { StoreType } from "../../store";
import CanvasElement from "./CanvasEl";

@injectable()
class OwnHand extends CanvasElement {
  _store: StoreType;
  _eventEmitter: EventEmitter;

  constructor(
    @inject<StoreType>(TYPES.Store) store: StoreType,
    @inject<EventEmitter>(TYPES.EventEmitter) eventEmitter: EventEmitter
  ) {
    super();
    this._store = store;
    this._eventEmitter = eventEmitter;
    this.addEventListeners();
  }
  addEventListeners() {
    this._eventEmitter.addEventListener(
      GameplayEvents.OWN_CARDS_RECEIVED,
      () => {
        console.log("OWN CARDS : ", this._store.get("ownHand"));
      }
    );
  }
  draw() {}
}

export default OwnHand;
