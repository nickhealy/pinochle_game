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
  winning_player: number | null;
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

export type GameplayContext = {
  turn: TurnContext;
  bid: BidContext;
  meld: MeldContext;
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
      type: "ADD_MELD";
      player: number;
      meld: Meld;
    }
  | {
      type: "COMMIT_MELDS";
      player: number;
    }
  | {
      type: "START_PLAY";
    };

export type GameControlEvents = { type: "START_GAME" } | { type: "NEW_GAME" };

export type ConnectionEvents =
  | { type: "FAILED_HEARTBEAT" }
  | { type: "RESUMED_HEARTBEAT" };

type SupervisorEvents = { type: "PLAYER_EVENT"; payload: any };

export type GameEvents =
  | ConnectionEvents
  | GameControlEvents
  | GameMachineEvents
  | PlayEvents
  | BidEvents
  | PrePlayEvents
  | SupervisorEvents;
