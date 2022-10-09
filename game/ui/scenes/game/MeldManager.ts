import { inject, injectable } from "inversify";
import { CardKeys, Suit } from "../../../backend/gameplay/Deck";
import { MeldType, POINTS_BY_MELD_TYPE } from "../../../backend/gameplay/Meld";
import TYPES from "../../../inversify-types";
import EventEmitter from "../../events/EventEmitter";
import { GameplayEvents } from "../../events/events";
import OwnPeerManager from "../../networking/OwnPeerManager";
import WebRTCSansIOClient from "../../networking/WebRTCSansIOClient";
import { StoreType } from "../../store";
import {
  CARD_HEIGHT,
  CARD_MOVE_UP_OFFSET,
  CARD_OFFSET,
  CARD_Z_INDEX,
} from "./OwnHand";

const MELDS_BY_KEYS: Record<string, MeldType> = {
  AC_AD_AH_AS: "four-A",
  KC_KD_KH_KS: "four-K",
  QC_QD_QH_QS: "four-Q",
  JC_JD_JH_JS: "four-J",
  "10C_AC_JC_KC_QC": "flush",
  "10H_AH_JH_KH_QH": "flush",
  "10D_AD_JD_KD_QD": "flush",
  "10S_AS_JS_KS_QS": "flush",
  JD_QS: "pinochle",
  "9D": "trump-nine",
  "9S": "trump-nine",
  "9H": "trump-nine",
  "9C": "trump-nine",
  KC_QC: "marriage",
  KH_QH: "marriage",
  KS_QS: "marriage",
  KD_QD: "marriage",
};

const SUITS_BY_KEY: Record<string, Suit> = {
  C: "clubs",
  D: "diamonds",
  S: "spades",
  H: "hearts",
};

export const MELD_OFFSET = 10;

@injectable()
class MeldManager {
  private _$ownCards: Array<HTMLImageElement> = [];
  private _submittedCardIdxs: Array<number> = [];
  private _currMeldIdxs: Array<number> = [];
  private _$gameplayContainer: HTMLDivElement;
  private _meldCoords: Array<{ top: number; left: number; zIndex: number }> =
    [];
  private $addMeldBtn: HTMLButtonElement;
  private $submitMeldsBtn: HTMLButtonElement;
  private store: StoreType;
  private ee: EventEmitter;
  private io: OwnPeerManager;

  constructor(
    @inject<EventEmitter>(TYPES.EventEmitter) ee: EventEmitter,
    @inject<OwnPeerManager>(TYPES.OwnPeerManager) io: OwnPeerManager,
    @inject<StoreType>(TYPES.Store) store: StoreType
  ) {
    this.ee = ee;
    this.io = io;
    this.store = store;
    this.$addMeldBtn = document.getElementById("add-meld") as HTMLButtonElement;
    this.$submitMeldsBtn = document.getElementById(
      "submit-melds"
    ) as HTMLButtonElement;
    this._$gameplayContainer = document.getElementById(
      "gameplay-container"
    ) as HTMLDivElement;

    this.addSubscriptions();
  }

  private doesMeldSuitMatchTrump(meld: Array<CardKeys>) {
    const trump = this.store.get("trump");
    const trumpKey = meld[0].slice(-1); // use first card as example
    return SUITS_BY_KEY[trumpKey] === trump;
  }

  private getCurrentMeldType() {
    const ownHandKeys = this.store.get("ownHand");
    const currMeldKeys = this._currMeldIdxs
      .map((idx) => ownHandKeys[idx])
      .sort();
    const meldKey = currMeldKeys.join("_");
    const meld = MELDS_BY_KEYS[meldKey];
    debugger;
    if (!meld) {
      return null;
    }
    if (
      (meld === "flush" || meld === "trump-nine") &&
      !this.doesMeldSuitMatchTrump(currMeldKeys)
    ) {
      return null;
    }
    if (meld === "marriage" && this.doesMeldSuitMatchTrump(currMeldKeys)) {
      return "royal-marriage";
    }
    return meld;
  }

  private addMeld() {
    const meldType = this.getCurrentMeldType();
    const ownHandKeys = this.store.get("ownHand");
    const currMeldKeys = this._currMeldIdxs.map((idx) => ownHandKeys[idx]);

    if (!meldType) {
      console.error("Not a valid meld");
      return;
    }
    this.ee.emit(GameplayEvents.ADD_MELD, {
      type: meldType,
      cards: currMeldKeys,
      points: POINTS_BY_MELD_TYPE[meldType],
    });
    this.io.send(WebRTCSansIOClient.addMeld(currMeldKeys, meldType));

    this.moveCardsToMeldPositions();
    this.$addMeldBtn.disabled = true;
  }

  private submitMelds() {
    this.ee.emit(GameplayEvents.SUBMIT_MELDS);
    this.io.send(WebRTCSansIOClient.submitMelds());
  }

  private addClickListeners() {
    this.$addMeldBtn.addEventListener("click", this.addMeld.bind(this));
    this.$submitMeldsBtn.addEventListener("click", this.submitMelds.bind(this));

    this._$ownCards.forEach(this.handleCardClick.bind(this));
  }

  private handleCardClick(cardEl: HTMLImageElement, idx: number) {
    cardEl.addEventListener("click", () => {
      if (this.addToCurrentMeld(idx)) {
        this.moveCardUp(cardEl);
      } else {
        this.moveCardDown(cardEl);
      }
    });
  }

  private moveCardUp(cardEl: HTMLImageElement) {
    cardEl.style.top = `${cardEl.offsetTop - CARD_MOVE_UP_OFFSET}px`;
  }

  private moveCardDown(cardEl: HTMLImageElement) {
    cardEl.style.top = `${cardEl.offsetTop + CARD_MOVE_UP_OFFSET}px`;
  }

  private moveCardsToMeldPositions() {
    this._currMeldIdxs.forEach((idx) => {
      const $submittedCardEl = this._$ownCards[idx];
      const { top, left, zIndex } =
        this._meldCoords[this._submittedCardIdxs.length];

      $submittedCardEl.style.top = `${top}px`;
      $submittedCardEl.style.left = `${left}px`;
      $submittedCardEl.style.zIndex = `${zIndex}`;

      this._submittedCardIdxs.push(idx);
    });
    this._currMeldIdxs = [];
  }

  private getMeldCoords() {
    const coords: Array<{ top: number; left: number; zIndex: number }> = [];
    const targetWidth = CARD_OFFSET * (12 - 1) + 95; // numCards - 1 cards show indices, face card shows whole card
    const midWayX = this._$gameplayContainer.offsetWidth / 2;
    const leftWidth = targetWidth / 2;
    const leftStart = Math.floor(midWayX - leftWidth);
    const handHeight = this._$ownCards[0].offsetTop;
    for (let i = 0; i < 12; i++) {
      coords.push({
        top: handHeight - (CARD_HEIGHT + MELD_OFFSET),
        left: leftStart + i * CARD_OFFSET,
        zIndex: CARD_Z_INDEX / 2 + i, // we want the bottom cards to still be higher
      });
    }
    return coords;
  }

  public registerHand(cards: Array<HTMLImageElement>) {
    this._$ownCards = cards;
    this._meldCoords = this.getMeldCoords();

    this.addClickListeners();
  }

  public checkForValidMeld() {
    if (this.getCurrentMeldType() === null) {
      this.$addMeldBtn.disabled = true;
    } else {
      this.$addMeldBtn.disabled = false;
    }
  }

  public addToCurrentMeld(idx: number) {
    // we use idx instead of CardKey because there can be multiple of same CardKey in single hand
    if (this._currMeldIdxs.includes(idx)) {
      this._currMeldIdxs.splice(this._currMeldIdxs.indexOf(idx));
      this.checkForValidMeld();
      return false;
    }
    this._currMeldIdxs.push(idx);
    this.checkForValidMeld();
    return true;
  }

  addSubscriptions() {
    this.ee.addEventListener(GameplayEvents.AWAITING_MELDS, () => {
      this.$addMeldBtn.classList.remove("hidden");
      this.$submitMeldsBtn.classList.remove("hidden");
    });
  }
}

export default MeldManager;
