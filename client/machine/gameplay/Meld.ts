import { CardKeys } from "./Deck";

abstract class Meld {
  value: number;

  constructor(value: number) {
    this.value = value;
  }

  abstract test(candidate: CardKeys[]): boolean;
}
