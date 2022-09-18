import { injectable } from "inversify";

const CARD_OFFSET = 15;

@injectable()
class OtherHand {
  private _$container: HTMLDivElement;
  private $cards: Array<HTMLImageElement>;
  constructor() {
    this._$container = document.getElementById(
      "west-hand-container"
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
    const midWay = this._$container.offsetHeight / 2;
    const topWidth = targetWidth / 2;
    const start = Math.floor(midWay - topWidth);
    debugger;
    for (let i = 0; i < numCards; i++) {
      coords.push(start + i * CARD_OFFSET);
    }
    return coords;
  }
  layoutCards() {
    const coords = this._getCardCoords();
    console.log({ coords });
    this.$cards.forEach((card, idx) => (card.style.top = `${coords[idx]}px`));
  }
  renderCards() {
    this.$cards.forEach((card) => this._$container.append(card));
    this.layoutCards();
    this._$container.classList.remove("hidden");
    this._$container.style.left = `-${this._$container.offsetWidth / 2}px`;
  }
  render() {
    this.renderCards();
  }
}

export default OtherHand;
