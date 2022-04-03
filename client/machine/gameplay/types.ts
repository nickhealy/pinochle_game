import TurnMachine from "../turn/machine";

interface BidContext {
  status: boolean[];
  bids: number[];
}

type TurnContext = number;

export type Context = {
  turn: TurnContext;
  bid: BidContext;
  turnMachine: typeof TurnMachine | null;
};

export type PlayEvents = { type: "PLAY_CARD" };
export type GameMachineEvents = { type: "CARDS_DEALT" };
export type BidEvents =
  | {
      type: "BID";
      value: number;
    }
  | { type: "FOLD"; isHez: boolean };

export type PrePlayEvents =
  | { type: "TRUMP_CHOSEN" }
  | { type: "SUBMIT_MELDS" }
  | { type: "EDIT_MELDS" }
  | { type: "CONFIRM" }
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
