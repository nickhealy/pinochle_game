import { inject, injectable } from "inversify";
import TYPES from "../../../inversify-types";
import EventEmitter from "../../events/EventEmitter";
import { GameplayEvents } from "../../events/events";
import { StoreType } from "../../store";

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

export const CARD_OFFSET = 35;
export const OFFSET_BOTTOM = 15;

@injectable()
class OwnHand {
  _store: StoreType;
  _eventEmitter: EventEmitter;
  _$gameplayContainer: HTMLDivElement;
  $ownCards: Array<HTMLImageElement> = [];
  $playSpace: HTMLDivElement;

  constructor(
    @inject<StoreType>(TYPES.Store) store: StoreType,
    @inject<EventEmitter>(TYPES.EventEmitter) eventEmitter: EventEmitter
  ) {
    this._store = store;
    this._eventEmitter = eventEmitter;
    this._$gameplayContainer = document.getElementById(
      "gameplay-container"
    ) as HTMLDivElement;
    this.$playSpace = document.getElementById(
      "own-card-space"
    ) as HTMLDivElement;
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
      cardEl.classList.add("card", "own-card", "deal-animation");

      this._addOwnCardListeners(cardEl, idx);

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

  private _addOwnCardListeners(cardEl: HTMLImageElement, idx: number) {
    cardEl.removeEventListener("click", () => {
      this.handleOwnCardClick(cardEl, idx);
    });
    cardEl.addEventListener("click", () => {
      this.handleOwnCardClick(cardEl, idx);
    });
  }

  private handleOwnCardClick(card: HTMLDivElement, idx: number) {
    const { top: playSpaceTopFromVp, left: playSpaceLeftFromVP } =
      this.$playSpace.getBoundingClientRect();
    const { top: boardTopFromVp, left: boardLeftFromVp } =
      this._$gameplayContainer.getBoundingClientRect();
    const ownPlaySpaceTopFromBoard = playSpaceTopFromVp - boardTopFromVp;
    const ownPlaySpaceLeftFromBoard = playSpaceLeftFromVP - boardLeftFromVp;
    card.style.removeProperty("bottom");
    card.style.top = `${ownPlaySpaceTopFromBoard}px`;
    card.style.left = `${ownPlaySpaceLeftFromBoard}px`;
    // this.layoutOwnHand();
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
