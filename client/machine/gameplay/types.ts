export type Context = {};

export type PlayEvents = { type: "PLAY_CARD" };
export type GameMachineEvents = { type: "CARDS_DEALT" };
export type BidEvents = { type: "BID_TURN_EXECUTE" };

export type PrePlayEvents =
  | { type: "TRUMP_CHOSEN" }
  | { type: "SUBMIT_MELDS" }
  | { type: "EDIT_MELDS" }
  | { type: "CONFIRM" }
  | { type: "REJECT" };

export type OuterGameEvents =
  | { type: "BEGIN_GAME" }
  | { type: "START_NEW_GAME" };

export type GameEvents =
  | OuterGameEvents
  | GameMachineEvents
  | PlayEvents
  | BidEvents
  | PrePlayEvents;
