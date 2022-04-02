export type Context = {};

export type TurnEvents =
  | { type: "NEXT_TURN" }
  | { type: "TO_P0" }
  | { type: "TO_P1" }
  | { type: "TO_P2" }
  | { type: "TO_P3" };
