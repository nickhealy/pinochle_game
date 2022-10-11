import { inject, injectable } from "inversify";
import { Card, CardKeys } from "../../../backend/gameplay/Deck";
import TYPES from "../../../inversify-types";
import EventEmitter from "../../events/EventEmitter";
import { GameplayEvents } from "../../events/events";
import OwnPeerManager from "../../networking/OwnPeerManager";
import WebRTCSansIOClient from "../../networking/WebRTCSansIOClient";
import { StoreType } from "../../store";
import MeldManager from "./MeldManager";
import MeldTally from "./MeldTally";

export const MOCK_OWN_HAND: Array<CardKeys> = [
  "KS",
  "QS",
  "JS",
  "JD",
  "9H",
  "AS",
  "9H",
  "JH",
  "AD",
  "JC",
  "9C",
  "10S",
];

export const CARD_OFFSET = 35;
export const OFFSET_BOTTOM = 15;
export const CARD_MOVE_UP_OFFSET = 30;
export const CARD_HEIGHT = 130;
export const CARD_Z_INDEX = 10;

const CARD_KEY_ATTR = "card-key";

@injectable()
class OwnHand {
  _store: StoreType;
  _eventEmitter: EventEmitter;
  io: OwnPeerManager;
  _$gameplayContainer: HTMLDivElement;
  meldManager: MeldManager;
  meldTally: MeldTally;
  $ownCards: Array<HTMLImageElement> = [];
  $ownPlaySpace: HTMLDivElement;
  $playContainer: HTMLDivElement;
  _listeners: Record<number, (e: Event) => void> = {};

  constructor(
    @inject<StoreType>(TYPES.Store) store: StoreType,
    @inject<MeldManager>(TYPES.MeldManager) meldManager: MeldManager,
    @inject<EventEmitter>(TYPES.EventEmitter) eventEmitter: EventEmitter,
    @inject<OwnPeerManager>(TYPES.OwnPeerManager) io: OwnPeerManager
  ) {
    this._store = store;
    this._eventEmitter = eventEmitter;
    this.io = io;
    this._$gameplayContainer = document.getElementById(
      "gameplay-container"
    ) as HTMLDivElement;
    this.$playContainer = document.getElementById(
      "play-area"
    ) as HTMLDivElement;
    this.$ownPlaySpace = document.getElementById(
      "own-card-space"
    ) as HTMLDivElement;
    this.meldManager = meldManager;
    this.meldTally = new MeldTally("own", eventEmitter, store);
    this.addEventListeners();
    this.initDevTools();
  }

  addEventListeners() {
    this._eventEmitter.addEventListener(
      GameplayEvents.OWN_CARDS_RECEIVED,
      () => {
        this.showOnTable();
      }
    );
    this._eventEmitter.addEventListener(GameplayEvents.AWAITING_MELDS, () => {
      this.meldManager.registerHand(this.$ownCards);
    });
    this._eventEmitter.addEventListener(GameplayEvents.PLAY_START, () => {
      this.$playContainer.classList.remove("hidden");
      this.addClickListeners();
    });
  }

  addClickListeners() {
    this.createClickListeners();
    this.$ownCards.forEach(($card, idx) =>
      $card.addEventListener("click", this._listeners[idx])
    );
  }

  createClickListeners() {
    this.$ownCards.forEach(
      ($el, idx) => (this._listeners[idx] = this.createClickListener($el, idx))
    );
  }

  private createClickListener(card: HTMLImageElement, idx: number) {
    return () => {
      this.playCard(idx, card);
    };
  }

  private playCard(idx: number, card: HTMLImageElement) {
    this.io.send(WebRTCSansIOClient.playCard(this._store.get("ownHand")[idx]));
    this.triggerPlayCardAnimations(card);
  }

  private triggerPlayCardAnimations(card: HTMLImageElement) {
    this.playCardAnimation(card);
    this.repositionOwnHand(card);
  }

  private getCardCoords() {
    // calculate position of first card so that hand can be centered
    // add x positions for each card from starting position
    const coords: Array<number> = [];
    const numCards = this.$ownCards.length;
    const targetWidth = CARD_OFFSET * (numCards - 1) + 95; // numCards - 1 cards show indices, face card shows whole card
    const midWayX = this._$gameplayContainer.offsetWidth / 2;
    const leftWidth = targetWidth / 2;
    const leftStart = Math.floor(midWayX - leftWidth);
    for (let i = 0; i < numCards; i++) {
      coords.push(leftStart + i * CARD_OFFSET);
    }
    return coords;
  }

  private createCards() {
    this._store.get("ownHand").forEach((card, idx) => {
      const cardEl = document.createElement("img");
      cardEl.src = `/cards/${card}.png`;
      cardEl.style.backgroundSize = "100%";
      cardEl.style.backgroundRepeat = "no-repeat";
      cardEl.classList.add("card", "own-card");
      cardEl.setAttribute(CARD_KEY_ATTR, card);
      this._$gameplayContainer.appendChild(cardEl);
      this.$ownCards.push(cardEl);
    });
    return this.$ownCards;
  }

  private init() {
    this._renderOwnHand();
  }

  private _renderOwnHand() {
    this.createCards();
    this.layoutOwnHand();
  }

  private showOnTable() {
    this.init();

    this.$ownCards.forEach((card) => {
      card.classList.add("slide-in");
    });
  }

  private layoutOwnHand() {
    const startingCardPositions = this.getCardCoords();
    this.$ownCards.forEach((card, idx) => {
      card.style.left = `${startingCardPositions[idx]}px`;
    });
  }

  private playCardAnimation(card: HTMLImageElement) {
    const { top: playSpaceTopFromVp, left: playSpaceLeftFromVP } =
      this.$ownPlaySpace.getBoundingClientRect();
    const { top: boardTopFromVp, left: boardLeftFromVp } =
      this._$gameplayContainer.getBoundingClientRect();
    const ownPlaySpaceTopFromBoard = playSpaceTopFromVp - boardTopFromVp;
    const ownPlaySpaceLeftFromBoard = playSpaceLeftFromVP - boardLeftFromVp;
    card.style.top = `${ownPlaySpaceTopFromBoard}px`;
    card.style.left = `${ownPlaySpaceLeftFromBoard}px`;
  }

  private repositionOwnHand(removedCard: HTMLImageElement) {
    this.$ownCards = this.$ownCards.filter((card) => card !== removedCard);
    this.layoutOwnHand();
  }

  private initDevTools() {
    this._store.set("ownHand", MOCK_OWN_HAND);
    // @ts-ignore
    globalThis.dealCards = () => {
      this._eventEmitter.emit(GameplayEvents.OWN_CARDS_RECEIVED);
    };
  }

  render() {
    this._$gameplayContainer.classList.remove("hidden");
  }
}

export default OwnHand;
