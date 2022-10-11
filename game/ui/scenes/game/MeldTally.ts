import { CardKeys } from "../../../backend/gameplay/Deck";
import { MeldType, POINTS_BY_MELD_TYPE } from "../../../backend/gameplay/Meld";
import EventEmitter from "../../events/EventEmitter";
import { GameplayEvents, LobbyEvents } from "../../events/events";
import { StoreType } from "../../store";
import { OpponentPosition } from "./OtherHand";

const MELD_TYPE_TO_NAMES: Record<MeldType, string> = {
  flush: "Flush",
  "four-A": "4 Aces",
  "four-J": "4 Jacks",
  "four-Q": "4 Queens",
  "four-K": "4 Kings",
  marriage: "Marriage",
  "royal-marriage": "Royal",
  pinochle: "Pinochle",
  "trump-nine": "9 of Trump",
};

class MeldTally {
  $_container: HTMLDivElement;
  ee: EventEmitter;
  _position: OpponentPosition | "own";
  store: StoreType;
  melds: Array<{ type: MeldType; points: number }> = [];
  constructor(
    position: OpponentPosition | "own",
    ee: EventEmitter,
    store: StoreType
  ) {
    this._position = position;
    this.$_container = document.getElementById(
      `meld-tally-${position}`
    ) as HTMLDivElement;

    this.ee = ee;
    this.store = store;
    this.initListeners();
  }

  get id() {
    return this._position === "own"
      ? this.store.get("ownId")
      : this.store.get("playerIdsByPosition")[this._position];
  }

  private _addMeld(meld: { type: MeldType; cards: Array<CardKeys> }) {
    this.melds.push({
      type: meld.type,
      points: POINTS_BY_MELD_TYPE[meld.type as MeldType],
    });
  }

  initListeners() {
    if (this._position === "own") {
      this.ee.addEventListener(GameplayEvents.ADD_MELD, (e) => {
        // @ts-ignore
        const meld = e.detail;
        this._addMeld(meld);
      });
      this.ee.addEventListener(
        GameplayEvents.SUBMIT_MELDS,
        this.showMeldTallyData.bind(this)
      );
    }

    this.ee.addEventListener(GameplayEvents.MELD_ADDED, (e) => {
      // @ts-ignore
      const { player, meld } = e.detail;
      if (player === this.id) {
        this._addMeld(meld);
      }
    });

    this.ee.addEventListener(GameplayEvents.MELDS_COMMITTED, (e) => {
      // @ts-ignore
      const { player } = e.detail;
      if (player == this.id) {
        this.showMeldTallyData();
      }
    });

    this.ee.addEventListener(GameplayEvents.PLAY_START, this.hide.bind(this));

    this.store.subscribe("playerIdsByPosition", (ids) => {
      const id =
        (this._position === "own" && this.store.get("ownId")) ||
        ids[this._position];
      const players = this.store.get("players");
      const player = players.find((player) => player.id === id);
      if (player) {
        const $nameEl = this.$_container.querySelector(
          ".meld-tally-name"
        ) as HTMLHeadingElement;
        $nameEl.innerText = player.name;
      }
    });
  }

  showMeldTallyData() {
    let totalPoints = 0;
    const $meldItemContainer = this.$_container.querySelector("ul");
    const $meldTallyTotal = this.$_container.querySelector(
      ".meld-tally-total"
    ) as HTMLHeadingElement;

    this.melds.forEach(({ type, points }) => {
      const $meldItem = document.createElement("li");
      $meldItem.innerHTML = `${MELD_TYPE_TO_NAMES[type]}<span>${points}</span>`;
      $meldItemContainer?.appendChild($meldItem);
      totalPoints += points;
    });
    $meldTallyTotal.innerText = `${totalPoints}`;
    this.render();
  }

  render() {
    this.$_container.classList.remove("hidden");
  }

  hide() {
    this.$_container.classList.add("hidden");
  }
}

export default MeldTally;
