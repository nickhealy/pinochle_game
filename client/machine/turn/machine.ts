import { createMachine } from "xstate";
import { Context, TurnEvents } from "./types";

export const TURN_MACHINE_ACTOR_ID = "turn_machine";
const TurnMachine = createMachine({
  tsTypes: {} as import("./machine.typegen").Typegen0,
  schema: {
    context: {} as Context,
    events: {} as TurnEvents,
  },
  id: "turnMachine",
  initial: "P0",
  states: {
    P0: {
      on: {
        NEXT_TURN: { target: "P1" },
        TO_P0: { target: "P0" },
        TO_P1: { target: "P1" },
        TO_P2: { target: "P2" },
        TO_P3: { target: "P3" },
      },
    },
    P1: {
      on: {
        NEXT_TURN: { target: "P2" },
        TO_P0: { target: "P0" },
        TO_P1: { target: "P1" },
        TO_P2: { target: "P2" },
        TO_P3: { target: "P3" },
      },
    },
    P2: {
      on: {
        NEXT_TURN: { target: "P3" },
        TO_P0: { target: "P0" },
        TO_P1: { target: "P1" },
        TO_P2: { target: "P2" },
        TO_P3: { target: "P3" },
      },
    },
    P3: {
      on: {
        NEXT_TURN: { target: "P0" },
        TO_P0: { target: "P0" },
        TO_P1: { target: "P1" },
        TO_P2: { target: "P2" },
        TO_P3: { target: "P3" },
      },
    },
  },
});

export default TurnMachine;
