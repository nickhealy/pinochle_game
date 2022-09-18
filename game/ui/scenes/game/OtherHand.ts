import { injectable } from "inversify";

const CARD_OFFSET = 15;

export enum OpponentPosition {
  NORTH = "north",
  WEST = "west",
  EAST = "east",
}

@injectable()
class OtherHand {
  private _$container: HTMLDivElement;
  private $cards: Array<HTMLImageElement>;
  private _position: OpponentPosition;
  constructor(opponentPosition: OpponentPosition) {
    this._position = opponentPosition;
    this._$container = document.getElementById(
      `${opponentPosition}-hand-container`
    ) as HTMLDivElement;
    this.$cards = this.createCards();
  }
  createCards() {
    const cards: Array<HTMLImageElement> = [];
    while (cards.length < 12) {
      const card = document.createElement("img") as HTMLImageElement;
      card.src = "/cards/card_back_black.png";
      card.classList.add("card");
      cards.push(card);
    }
    return cards;
  }
  _getCardCoords() {
    const coords: Array<number> = [];
    const numCards = this._$container.querySelectorAll(".card").length;
    const targetWidth = CARD_OFFSET * (numCards - 1) + 95;
    const midWay =
      this._$container[
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
    this.$cards.forEach((card) => this._$container.append(card));
    this.layoutCards();
    this._$container.classList.remove("hidden");

    if (this._position == OpponentPosition.WEST) {
      this._$container.style.left = `-${this._$container.offsetWidth / 2}px`;
    } else if (this._position == OpponentPosition.NORTH) {
      this._$container.style.top = `-${this._$container.offsetHeight / 2}px`;
    } else if (this._position == OpponentPosition.EAST) {
      this._$container.style.right = `-${this._$container.offsetWidth / 2}px`;
    }
  }
  render() {
    this.renderCards();
  }
}

export default OtherHand;
