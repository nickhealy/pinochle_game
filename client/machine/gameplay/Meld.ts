import { CardKeys, Suit } from "./Deck";

type MeldType =
  | "marriage"
  | "royal-marriage"
  | "trump-nine"
  | "flush"
  | "pinochle"
  | "four-J"
  | "four-Q"
  | "four-K"
  | "four-A";

export interface Meld {
  type: MeldType;
  cards: CardKeys[];
}

const POINTS_BY_MELD_TYPE: Record<MeldType, number> = {
  marriage: 20,
  "royal-marriage": 40,
  "trump-nine": 10,
  flush: 150,
  pinochle: 40,
  "four-A": 100,
  "four-J": 40,
  "four-Q": 60,
  "four-K": 80,
};

const getMeldPoints = (type: MeldType) => POINTS_BY_MELD_TYPE[type];

export const sumPlayerMelds = (melds: Meld[]) =>
  melds.reduce((acc, { type }) => acc + getMeldPoints(type), 0);
