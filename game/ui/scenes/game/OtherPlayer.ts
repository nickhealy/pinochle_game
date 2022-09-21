import "reflect-metadata";
import { inject, injectable } from "inversify";
import TYPES from "../../../inversify-types";
import main from "../../../inversify.config";
import EventEmitter from "../../events/EventEmitter";
import { GameplayEvents, LobbyEvents } from "../../events/events";
import { StoreType } from "../../store";
import OtherHand, { OpponentPosition } from "./OtherHand";

@injectable()
class OtherPlayer {
  private _$infoContainer: HTMLDivElement;
  private _eventEmitter: EventEmitter;
  private _position: OpponentPosition | null = null;
  private _store: StoreType;
  private id: string | null = null;
  private hand: OtherHand;
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

  assignId(id: string) {
    this.id = id;
    this.showPlayerInfo();
  }

  private showPlayerInfo() {
    const data = this._store
      .get("players")
      .find((player) => player.id === this.id); // this should be rewritten to be dict lookup

    if (!data) {
      throw new Error(`Player data does not exist. Id : ${this.id}`);
    }

    const $nameEl = this._$infoContainer.querySelector("h5");
    if ($nameEl) {
      $nameEl.innerText = data.name;
    }
  }

  removeTurnIndicator() {
    const turnIndicatorEl = this._$infoContainer.querySelector("i");
    turnIndicatorEl?.classList.add("hidden");
  }

  showTurnIndicator() {
    const turnIndicatorEl = this._$infoContainer.querySelector("i");
    turnIndicatorEl?.classList.remove("hidden");
  }

  initializeSubscriptions() {
    this._eventEmitter.addEventListener(
      GameplayEvents.AWAITING_BID,
      (event) => {
        // @ts-ignore using typescript was a mistake
        const { player } = event.detail;
        if (player !== this.id) {
          this.removeTurnIndicator();
        } else {
          this.showTurnIndicator();
        }
      }
    );
  }
}

export default OtherPlayer;
