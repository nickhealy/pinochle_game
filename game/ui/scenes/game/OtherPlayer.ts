import "reflect-metadata";
import { inject, injectable } from "inversify";
import TYPES from "../../../inversify-types";
import main from "../../../inversify.config";
import EventEmitter from "../../events/EventEmitter";
import { GameplayEvents, LobbyEvents } from "../../events/events";
import { StoreType } from "../../store";
import OtherHand, { OpponentPosition } from "./OtherHand";
import MeldTally from "./MeldTally";

@injectable()
class OtherPlayer {
  private _$infoContainer: HTMLDivElement;
  private $bidVal: HTMLElement;
  private _eventEmitter: EventEmitter;
  private _store: StoreType;
  private _position: OpponentPosition;
  private hand: OtherHand;
  private meldTally: MeldTally;
  constructor(position: OpponentPosition, store: StoreType, ee: EventEmitter) {
    this._position = position;
    this._$infoContainer = document.getElementById(
      `${position}-player-info`
    ) as HTMLDivElement;
    this.$bidVal = this._$infoContainer.querySelector(
      ".player-bid-val"
    ) as HTMLElement;
    this.hand = new OtherHand(position, ee); // i could use inversify here, but not really important
    this.meldTally = new MeldTally(position, ee, store);
    this._eventEmitter = ee;
    this._store = store;

    this.initializeSubscriptions();
  }
  render() {
    this.hand.render();
  }

  get id() {
    return this._store.get("playerIdsByPosition")[this._position];
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

  showPlayerBid(bid: number) {
    this.$bidVal.innerText = `${bid}`;
  }

  resetPlayerInfo() {
    this.$bidVal.innerText = "";
  }

  showPlayerPass() {
    this.$bidVal.innerText = "PASS";
    this.$bidVal.classList.add("pass");
  }

  _doIfIsPlayerElse(
    e: Event,
    ifCb: (...args: Array<any>) => void,
    elseCb?: (...args: Array<any>) => void
  ) {
    // @ts-ignore using typescript was a mistake
    const { player } = e.detail;

    if (player == this.id) {
      ifCb();
    } else if (elseCb) {
      elseCb();
    }
  }

  maybeShowTurnIndicator(e: Event) {
    // @ts-ignore using typescript was a mistake
    const { player } = e.detail;
    if (player !== this.id) {
      this.removeTurnIndicator();
    } else {
      this.showTurnIndicator();
    }
  }

  initializeSubscriptions() {
    this._eventEmitter.addEventListener(
      GameplayEvents.AWAITING_BID,
      this.maybeShowTurnIndicator.bind(this)
    );
    this._eventEmitter.addEventListener(
      GameplayEvents.PLAYER_PLAY_TURN,
      this.maybeShowTurnIndicator.bind(this)
    );
    this._eventEmitter.addEventListener(
      GameplayEvents.TRUMP_CHOOSING,
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
    this._eventEmitter.addEventListener(GameplayEvents.PLAYER_BID, (event) => {
      // @ts-ignore using typescript was a mistake
      const { player, bid } = event.detail;
      if (player === this.id) {
        this.showPlayerBid(bid);
      }
    });
    this._eventEmitter.addEventListener(GameplayEvents.PASS_BID, (event) => {
      // @ts-ignore using typescript was a mistake
      const { player } = event.detail;
      if (player === this.id) {
        this.showPlayerPass();
      }
    });

    this._eventEmitter.addEventListener(GameplayEvents.AWAITING_MELDS, () => {
      this._$infoContainer.classList.add("hidden");
      this.resetPlayerInfo();
    });

    this._eventEmitter.addEventListener(GameplayEvents.MELD_ADDED, (event) => {
      // @ts-ignore using typescript was a mistake
      const { player, meld } = event.detail;
      if (player === this.id) {
        this.hand.showMeld(meld.cards);
      }
    });

    this._eventEmitter.addEventListener(GameplayEvents.PLAY_START, () => {
      this._$infoContainer.classList.remove("hidden");
    });

    this._eventEmitter.addEventListener(
      GameplayEvents.PLAYER_PLAY_CARD,
      (event) =>
        // @ts-ignore
        this._doIfIsPlayerElse(event, () =>
          // @ts-ignore
          this.hand.playCard(event.detail.card)
        )
    );

    this._store.subscribe(
      "playerIdsByPosition",
      this.showPlayerInfo.bind(this)
    );
  }
}

export default OtherPlayer;
