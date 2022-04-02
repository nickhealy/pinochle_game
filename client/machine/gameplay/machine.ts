import { createMachine, assign, spawn } from "xstate";

import TurnMachine from "../turn/machine";
import { Context, GameEvents } from "./types";

const GameMachine = createMachine(
  {
    tsTypes: {} as import("./machine.typegen").Typegen0,
    schema: {
      context: {} as Context,
      events: {} as GameEvents,
    },
    id: "fullGameMachine",
    initial: "pre_game",
    type: "compound",
    context: {
      turn_machine: null,
    },
    states: {
      pre_game: {
        on: {
          BEGIN_GAME: { target: "game_in_progress" },
        },
      },
      game_in_progress: {
        id: "gameMachine",
        initial: "deal",
        type: "compound",
        entry: assign({
          turn_machine: () => spawn(TurnMachine),
        }),
        states: {
          deal: {
            on: {
              CARDS_DEALT: { target: "bid" },
            },
          },
          bid: {
            id: "bidMachine",
            initial: "awaiting_bid",
            states: {
              awaiting_bid: {
                on: {
                  BID_TURN_EXECUTE: [
                    {
                      target: "#prePlayMachine.awaiting_trump",
                      cond: "isBiddingWon",
                    },
                    { target: "awaiting_bid" },
                  ],
                },
              },
            },
          },
          pre_play: {
            id: "prePlayMachine",
            type: "compound",
            initial: "awaiting_trump",
            states: {
              awaiting_trump: {
                on: {
                  TRUMP_CHOSEN: { target: "meld_submission" },
                },
              },
              meld_submission: {
                on: {
                  SUBMIT_MELDS: [
                    { target: "meld_confirm", cond: "allMeldsSubmitted" },
                    { target: "meld_submission" },
                  ],
                  EDIT_MELDS: { target: "meld_submission" },
                },
              },
              meld_confirm: {
                on: {
                  CONFIRM: [
                    {
                      target: "#gameMachine.play",
                      cond: "allPlayersReady",
                    },
                    {
                      target: "meld_confirm",
                    },
                  ],
                  REJECT: { target: "meld_submission" },
                },
              },
            },
          },
          play: {
            id: "playMachine",
            initial: "pos_a",
            states: {
              pos_a: {
                on: {
                  PLAY_CARD: { target: "pos_b" },
                },
              },
              pos_b: {
                on: {
                  PLAY_CARD: { target: "pos_c" },
                },
              },
              pos_c: {
                on: {
                  PLAY_CARD: { target: "pos_d" },
                },
              },
              pos_d: {
                on: {
                  PLAY_CARD: { target: "trick_end" },
                },
              },
              trick_end: {
                always: [
                  { target: "#gameMachine.round_end", cond: "isPlayOver" },
                  { target: "pos_a" },
                ],
              },
            },
          },
          round_end: {
            always: [
              {
                target: "#fullGameMachine.post_game",
                cond: "isGamePlayOver",
              },
              { target: "deal" },
            ],
          },
        },
      },
      post_game: {
        // id: 'post'
        on: {
          START_NEW_GAME: { target: "pre_game" },
        },
      },
    },
  },
  {
    guards: {
      isBiddingWon: () => true,
      allPlayersReady: () => true,
      isGamePlayOver: () => true,
      allMeldsSubmitted: () => true,
      isPlayOver: () => true,
    },
  }
);

export default GameMachine;
