import { inject, injectable } from "inversify";
import TYPES from "../../../inversify-types";
import EventEmitter from "../../events/EventEmitter";
import { GameplayEvents } from "../../events/events";
import { StoreType } from "../../store";
import CanvasElement from "./CanvasEl";

const MOCK_OWN_HAND = [
  "KH",
  "QC",
  "JS",
  "JD",
  "9H",
  "AS",
  "9H",
  "JS",
  "AD",
  "JC",
  "9C",
  "10S",
];

@injectable()
class OwnHand extends CanvasElement {
  _store: StoreType;
  _eventEmitter: EventEmitter;
  _canvas: HTMLCanvasElement;

  constructor(
    @inject<StoreType>(TYPES.Store) store: StoreType,
    @inject<EventEmitter>(TYPES.EventEmitter) eventEmitter: EventEmitter
  ) {
    super();
    this._store = store;
    this._eventEmitter = eventEmitter;
    this._canvas = document.getElementById(
      "own-hand-canvas"
    ) as HTMLCanvasElement;
    this.addEventListeners();
    this.initDevTools();
  }

  addEventListeners() {
    this._eventEmitter.addEventListener(
      GameplayEvents.OWN_CARDS_RECEIVED,
      () => {
        console.log("OWN CARDS : ", this._store.get("ownHand"));
      }
    );
  }

  initDevTools() {
    this._store.set("ownHand", MOCK_OWN_HAND);
    // @ts-ignore
    globalThis.dealCards = () => {
      this._eventEmitter.emit(GameplayEvents.OWN_CARDS_RECEIVED);
    };
  }

  draw() {}
}

export default OwnHand;
