export type Suit = "hearts" | "clubs" | "spades" | "diamonds";
export type Rank = "9" | "J" | "Q" | "K" | "10" | "A";
export type CardKeys =
  | "9C"
  | "JC"
  | "QC"
  | "KC"
  | "10C"
  | "AC"
  | "9H"
  | "JH"
  | "QH"
  | "KH"
  | "10H"
  | "AH"
  | "9D"
  | "JD"
  | "QD"
  | "KD"
  | "10D"
  | "AD"
  | "9S"
  | "JS"
  | "QS"
  | "KS"
  | "10S"
  | "AS";

export class Card {
  readonly key: CardKeys;
  readonly suit: Suit;
  readonly rank: Rank;
  readonly points: number;
  readonly value: number;
  constructor(
    key: CardKeys,
    rank: Rank,
    suit: Suit,
    points: number,
    value: number = 0
  ) {
    this.key = key;
    this.suit = suit;
    this.rank = rank;
    this.points = points;
    this.value = value;
  }

  isSuit(suit: Suit) {
    return this.suit === suit;
  }
}

// Fisher-Yates (aka Knuth) Shuffle.
const shuffle = (keys: CardKeys[]) => {
  let currentIndex = keys.length,
    randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [keys[currentIndex], keys[randomIndex]] = [
      keys[randomIndex],
      keys[currentIndex],
    ];
  }

  return keys;
};

const createRegistry = () => {
  const registry = {} as Record<CardKeys, Card>;
  const cardinalInfo: [Rank, number, number][] = [
    ["9", 0, 0],
    ["J", 1, 0],
    ["Q", 2, 5],
    ["K", 3, 5],
    ["10", 4, 10],
    ["A", 5, 10],
  ];
  const suits: Suit[] = ["clubs", "diamonds", "hearts", "spades"];

  for (const suit of suits) {
    for (const [rank, value, points] of cardinalInfo) {
      const key = `${rank}${suit.toUpperCase()[0]}` as CardKeys;
      registry[key] = new Card(key, rank, suit, points, value);
    }
  }

  return registry;
};

const registry = createRegistry();

export default {
  getNewHands: () => {
    const hands: CardKeys[][] = [];
    const keys = [
      ...Object.keys(registry),
      ...Object.keys(registry),
    ] as CardKeys[];
    const shuffledKeys = shuffle(keys);
    while (shuffledKeys.length) {
      hands.push(shuffledKeys.splice(0, 12));
    }
    return hands;
  },
  getCardFromKey: (key: CardKeys) => registry[key],
};
