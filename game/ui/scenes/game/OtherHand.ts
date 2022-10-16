import { injectable } from "inversify";
import { Card, CardKeys } from "../../../backend/gameplay/Deck";
import EventEmitter from "../../events/EventEmitter";
import { GameplayEvents } from "../../events/events";
import { MELD_OFFSET } from "./MeldManager";
import { CARD_HEIGHT, CARD_OFFSET as OWN_CARD_OFFSET } from "./OwnHand";

const CARD_OFFSET = 15;
const CARD_OFFSET_MELD = OWN_CARD_OFFSET;
const CARD_END_SPACER = -(CARD_HEIGHT / 2);
const CARD_END_SPACER_MELD = CARD_HEIGHT / 2 + MELD_OFFSET;

export enum OpponentPosition {
  NORTH = "north",
  WEST = "west",
  EAST = "east",
}

@injectable()
class OtherHand {
  private _$gameplayContainer: HTMLDivElement;
  private $cards: Array<HTMLImageElement> = [];
  private $playSpace: HTMLDivElement;
  private _position: OpponentPosition;
  private cardsInMelds: Array<CardKeys> = [];
  private ee: EventEmitter;

  constructor(opponentPosition: OpponentPosition, ee: EventEmitter) {
    this._position = opponentPosition;
    this.$playSpace = document.getElementById(
      `${opponentPosition}-card-space`
    ) as HTMLDivElement;
    this._$gameplayContainer = document.getElementById(
      "gameplay-container"
    ) as HTMLDivElement;
    this.ee = ee;

    this.addListeners();
  }

  addListeners() {
    this.ee.addEventListener(GameplayEvents.PLAY_START, () => {
      this.layoutCards();
      this.$cards.forEach(this.turnFacedown);
    });

    this.ee.addEventListener(
      GameplayEvents.OWN_CARDS_RECEIVED,
      this.renderCards.bind(this)
    );
  }

  createCards() {
    const cards: Array<HTMLImageElement> = [];
    while (cards.length < 12) {
      const card = document.createElement("img") as HTMLImageElement;
      card.src = "/cards/card_back_black.png";
      card.classList.add("card", `${this._position}-opponent-card`);
      cards.push(card);
    }
    this.$cards = cards;
  }
  _getCardCoords(sideOffset = CARD_OFFSET, endOffset = CARD_END_SPACER) {
    const coords: Array<{ end: number; side: number }> = [];
    const numCards = this.$cards.length;
    const targetWidth = sideOffset * (numCards - 1) + 95;
    const midWay =
      this._$gameplayContainer[
        this._position == OpponentPosition.NORTH
          ? "offsetWidth"
          : "offsetHeight"
      ] / 2;
    const topWidth = targetWidth / 2;
    const start = Math.floor(midWay - topWidth);
    for (let i = 0; i < numCards; i++) {
      coords.push({ side: start + i * sideOffset, end: endOffset });
    }
    return coords;
  }

  layoutCards() {
    const coords = this._getCardCoords();
    this.$cards.forEach((card, idx) => {
      this._moveCardToCoord(card, coords[idx]);
    });
  }

  renderCards() {
    this.createCards();
    this.layoutCards();
    this.$cards.forEach((card) => {
      this._$gameplayContainer.append(card);
      card.classList.add("slide-in");
    });
  }

  getUnusedMeldCards(cards: Array<CardKeys>) {
    // only show *new* cards (unused)
    const unusedCards = cards.reduce((acc, curr) => {
      if (!this.cardsInMelds.includes(curr)) {
        acc.push(curr);
      }
      return acc;
    }, [] as Array<CardKeys>);

    if (unusedCards.length === 0) {
      return cards; // if no cards are being shared between melds, then render as new meld
    }

    return unusedCards;
  }

  _moveCardToCoord(
    $cardEl: HTMLImageElement,
    coord: { end: number; side: number }
  ) {
    const { end: endOffset, side: sideOffset } = coord;
    if (this._position == OpponentPosition.WEST) {
      $cardEl.style.top = `${sideOffset}px`;
      $cardEl.style.left = `${endOffset}px`;
    } else if (this._position == OpponentPosition.NORTH) {
      $cardEl.style.top = `${endOffset}px`;
      $cardEl.style.left = `${sideOffset}px`;
    } else if (this._position == OpponentPosition.EAST) {
      $cardEl.style.top = `${sideOffset}px`;
      $cardEl.style.left = `calc(100% - ${endOffset + CARD_HEIGHT}px)`; // todo figure out why this is correct
    }
  }

  showMeld(cards: Array<CardKeys>) {
    const coords = this._getCardCoords(CARD_OFFSET_MELD, CARD_END_SPACER_MELD);
    let lastMeldCardIdx = this.cardsInMelds.length;

    this.cardsInMelds.push(...this.getUnusedMeldCards(cards));

    while (lastMeldCardIdx < this.cardsInMelds.length) {
      const $cardEl = this.$cards[lastMeldCardIdx];
      this._moveCardToCoord($cardEl, coords[lastMeldCardIdx]);
      this.turnFaceup($cardEl, this.cardsInMelds[lastMeldCardIdx++]);
    }
  }

  private turnFaceup(cardEl: HTMLImageElement, cardKey: CardKeys) {
    cardEl.src = `/cards/${cardKey}.png`;
  }

  private turnFacedown(cardEl: HTMLImageElement) {
    cardEl.src = "/cards/card_back_black.png";
  }

  private playCardAnimation(card: HTMLImageElement) {
    const { top: playSpaceTopFromVp, left: playSpaceLeftFromVP } =
      this.$playSpace.getBoundingClientRect();
    const { top: boardTopFromVp, left: boardLeftFromVp } =
      this._$gameplayContainer.getBoundingClientRect();
    const ownPlaySpaceTopFromBoard = playSpaceTopFromVp - boardTopFromVp;
    const ownPlaySpaceLeftFromBoard = playSpaceLeftFromVP - boardLeftFromVp;
    card.style.top = `${ownPlaySpaceTopFromBoard}px`;
    card.style.left = `${ownPlaySpaceLeftFromBoard}px`;

    if (
      this._position == OpponentPosition.WEST ||
      this._position == OpponentPosition.EAST
    ) {
      card.style.transform = "rotate(0deg)";
    }
  }

  playCard(cardKey: CardKeys) {
    const cardEl = this.$cards.shift()!; // safe to assume this exists here
    this.turnFaceup(cardEl, cardKey);
    this.playCardAnimation(cardEl);

    cardEl.setAttribute("data-played", "true"); // this is terrible
  }
}

export default OtherHand;
