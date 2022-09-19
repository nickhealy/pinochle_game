import { injectable } from "inversify";
import { CardKeys } from "../../../backend/gameplay/Deck";

const CARD_OFFSET = 15;

export enum OpponentPosition {
  NORTH = "north",
  WEST = "west",
  EAST = "east",
}

@injectable()
class OtherHand {
  private _$gameplayContainer: HTMLDivElement;
  private $cards: Array<HTMLImageElement>;
  private $playSpace: HTMLDivElement;
  private _position: OpponentPosition;
  constructor(opponentPosition: OpponentPosition) {
    this._position = opponentPosition;
    this.$playSpace = document.getElementById(
      `${opponentPosition}-card-space`
    ) as HTMLDivElement;
    this._$gameplayContainer = document.getElementById(
      "gameplay-container"
    ) as HTMLDivElement;
    this.$cards = this.createCards();
  }
  createCards() {
    const cards: Array<HTMLImageElement> = [];
    while (cards.length < 12) {
      const card = document.createElement("img") as HTMLImageElement;
      card.src = "/cards/card_back_black.png";
      card.classList.add("card", `${this._position}-opponent-card`);
      cards.push(card);
    }
    return cards;
  }
  _getCardCoords() {
    const coords: Array<number> = [];
    const numCards = this.$cards.length;
    const targetWidth = CARD_OFFSET * (numCards - 1) + 95;
    const midWay =
      this._$gameplayContainer[
        this._position == OpponentPosition.NORTH
          ? "offsetWidth"
          : "offsetHeight"
      ] / 2;
    const topWidth = targetWidth / 2;
    const start = Math.floor(midWay - topWidth);
    for (let i = 0; i < numCards; i++) {
      coords.push(start + i * CARD_OFFSET);
    }
    return coords;
  }
  layoutCards() {
    const coords = this._getCardCoords();
    this.$cards.forEach((card, idx) => {
      if (
        this._position == OpponentPosition.WEST ||
        this._position == OpponentPosition.EAST
      ) {
        card.style.top = `${coords[idx]}px`;
      } else if (this._position == OpponentPosition.NORTH) {
        card.style.left = `${coords[idx]}px`;
      }
    });
  }
  renderCards() {
    this.layoutCards();
    this.$cards.forEach((card) => {
      this._$gameplayContainer.append(card);
      card.classList.add("slide-in");
    });
  }

  private turnFaceup(cardEl: HTMLImageElement, cardKey: CardKeys) {
    cardEl.src = `/cards/${cardKey}.png`;
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
      card.style.transform = "rotate(90deg)";
    }
  }

  playCard(cardKey: CardKeys) {
    const cardEl = this.$cards.shift()!; // safe to assume this exists here
    this.turnFaceup(cardEl, cardKey);
    this.playCardAnimation(cardEl);
  }

  render() {
    this.renderCards();
  }
}

export default OtherHand;
