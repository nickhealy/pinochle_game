import "reflect-metadata";
import { inject, injectable } from "inversify";
import TYPES from "../../../inversify-types";
import main from "../../../inversify.config";
import EventEmitter from "../../events/EventEmitter";
import { LobbyEvents } from "../../events/events";
import { StoreType } from "../../store";
import OtherHand, { OpponentPosition } from "./OtherHand";

@injectable()
class OtherPlayer {
  _$infoContainer: HTMLDivElement;
  _eventEmitter: EventEmitter;
  _position: OpponentPosition | null = null;
  _store: StoreType;
  hand: OtherHand;
  constructor(position: OpponentPosition, store: StoreType, ee: EventEmitter) {
    this._position = position;
    this._$infoContainer = document.getElementById(
      `${position}-player-info`
    ) as HTMLDivElement;
    this.hand = new OtherHand(position); // i could use inversify here, but not really important
    this._eventEmitter = ee;
    this._store = store;
    this.initializeSubscriptions();
  }
  render() {
    this.hand.render();
  }
  initializeSubscriptions() {
    this._eventEmitter.addEventListener(LobbyEvents.TEAMS_RECEIVED, () => {
      const ownId = this._store.get("ownId");
    });
  }
}

export default OtherPlayer;
