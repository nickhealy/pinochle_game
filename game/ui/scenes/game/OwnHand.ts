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

const CARD_OFFSET = 35;

@injectable()
class OwnHand {
  _store: StoreType;
  _eventEmitter: EventEmitter;
  _$container: HTMLDivElement;

  constructor(
    @inject<StoreType>(TYPES.Store) store: StoreType,
    @inject<EventEmitter>(TYPES.EventEmitter) eventEmitter: EventEmitter
  ) {
    this._store = store;
    this._eventEmitter = eventEmitter;
    this._$container = document.getElementById(
      "own-card-container"
    ) as HTMLDivElement;
    this.addEventListeners();
    this.initDevTools();
  }

  addEventListeners() {
    this._eventEmitter.addEventListener(
      GameplayEvents.OWN_CARDS_RECEIVED,
      () => {
        console.log("OWN CARDS : ", this._store.get("ownHand"));
        this.showOnTable();
      }
    );
  }

  private get _$ownCards(): Array<HTMLImageElement> {
    return Array.from(this._$container.querySelectorAll(".own-card"));
  }

  private getCardCoords() {
    // calculate position of first card so that hand can be centered
    // add x positions for each card from starting position
    const coords: Array<number> = [];
    const numCards = this._$ownCards.length;
    const targetWidth = CARD_OFFSET * (numCards - 1) + 90; // numCards - 1 cards show indices, face card shows whole card
    const midWayX = this._$container.offsetWidth / 2;
    const leftWidth = targetWidth / 2;
    const leftStart = Math.floor(midWayX - leftWidth);
    for (let i = 0; i < numCards; i++) {
      coords.push(leftStart + i * CARD_OFFSET);
    }
    return coords;
  }

  private addCardImages() {
    this._store.get("ownHand").forEach((card, idx) => {
      this._$ownCards[idx].src = `/cards/${card}.png`;
      this._$ownCards[idx].style.backgroundSize = "100%";
      this._$ownCards[idx].style.backgroundRepeat = "no-repeat";
    });
  }

  private init() {
    this._addOwnCardListeners();
    this._renderOwnHand();
  }

  private _renderOwnHand() {
    this.layoutOwnHand();
    this.addCardImages();
  }

  private showOnTable() {
    this.init();

    this._$container.style.bottom = "25px";
  }

  private layoutOwnHand() {
    const startingCardPositions = this.getCardCoords();
    this._$ownCards.forEach((card, idx) => {
      card.style.left = `${startingCardPositions[idx]}px`;
    });
  }

  private _addOwnCardListeners() {
    this._$ownCards.forEach((card, idx) => {
      card.removeEventListener("click", () => {
        this.handleOwnCardClick(card, idx);
      });
      card.addEventListener("click", () => {
        this.handleOwnCardClick(card, idx);
      });
    });
  }

  private handleOwnCardClick(card: HTMLDivElement, idx: number) {
    console.log("clicked card at idx : ", idx);
    this._$container.removeChild(card); // this is temporary
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
    this._$container.classList.remove("hidden");
  }

  // deal animation -- cards pop up

  draw() {}
}

export default OwnHand;
