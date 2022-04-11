import { CardKeys, Suit } from "./Deck";
import { Meld } from "./Meld";

interface BidContext {
  status: boolean[];
  bids: number[];
  bidWinner: number;
}

type TurnContext = number;

export interface Play {
  key: CardKeys;
  player: number;
}

interface PlayContext {
  currentPlays: Play[];
  pastPlays: Play[][];
  playerHands: CardKeys[][];
  trump: Suit | null;
}

type MeldContext = Meld[][];

interface RoundScoreContext {
  points: number[][];
}

interface GameScoreContext {
  dealer: number;
  score: number[];
}

export type Context = {
  turn: TurnContext;
  bid: BidContext;
  melds: MeldContext;
  play: PlayContext;
  round: RoundScoreContext;
  game: GameScoreContext;
};

export type PlayEvents = { type: "PLAY_CARD"; key: CardKeys; player: number };
export type GameMachineEvents = { type: "CARDS_DEALT" };
export type BidEvents =
  | {
      type: "BID";
      value: number;
    }
  | { type: "FOLD"; isHez: boolean };

export type PrePlayEvents =
  | { type: "TRUMP_CHOSEN"; trump: Suit }
  | {
      type: "SUBMIT_MELDS";
      player: number;
      melds: Meld[];
    }
  | { type: "EDIT_MELD"; player: number }
  | { type: "PLAYER_READY" }
  | { type: "PLAYER_REJECT"; player: number }
  | { type: "REJECT" };

export type GameControlEvents =
  | { type: "BEGIN_GAME" }
  | { type: "START_NEW_GAME" };

export type ConnectionEvents =
  | { type: "FAILED_HEARTBEAT" }
  | { type: "RESUMED_HEARTBEAT" };

export type GameEvents =
  | ConnectionEvents
  | GameControlEvents
  | GameMachineEvents
  | PlayEvents
  | BidEvents
  | PrePlayEvents;
