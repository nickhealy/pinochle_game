import { createConfigItem } from "@babel/core";
import { createMachine, assign, spawn, send, actions } from "xstate";

import TurnMachine, { TURN_MACHINE_ACTOR_ID } from "../turn/machine";
import { Context, GameEvents } from "./types";

const { log } = actions;

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
      turn: 0,
      bid: {
        status: [true, true, true, true],
        bids: [0, 0, 0, 0],
      },
      turnMachine: null,
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
          turnMachine: () =>
            spawn(TurnMachine, { name: TURN_MACHINE_ACTOR_ID, sync: true }),
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
            entry: log("starting bid", "[bid]"),
            states: {
              awaiting_bid: {
                entry: log("awaiting next bid", "[bid]"),
                on: {
                  BID: {
                    target: "bid_choice_pseudostate",
                    actions: "playerBid",
                  },
                  FOLD: {
                    target: "bid_choice_pseudostate",
                    actions: "playerFold",
                  },
                },
              },
              // choice pseudostate for either continuing with bid or declaring winner
              bid_choice_pseudostate: {
                entry: log(
                  (_, evt) =>
                    `bid turn executed, type: ${evt.type}, value: ${
                      // @ts-expect-error typing is weird here
                      evt.type == "BID" ? evt.value : null
                    }`,
                  "[bid]"
                ),
                always: [
                  {
                    target: "#prePlayMachine.awaiting_trump",
                    cond: "isBiddingWon",
                  },
                  {
                    target: "awaiting_bid",
                    actions: "nextTurnBid",
                  },
                ],
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
          history: {
            type: "history",
            history: "deep",
          },
        },
      },
      post_game: {
        // id: 'post'
        on: {
          START_NEW_GAME: { target: "pre_game" },
        },
      },
      failed_heartbeat: {
        on: {
          RESUMED_HEARTBEAT: { target: "game_in_progress.history" },
        },
      },
    },
    on: {
      FAILED_HEARTBEAT: { target: "failed_heartbeat" },
    },
  },
  {
    guards: {
      isBiddingWon: (ctx, _) => ctx.bid.status.filter((st) => st).length === 1,
      allPlayersReady: () => true,
      isGamePlayOver: () => true,
      allMeldsSubmitted: () => true,
      isPlayOver: () => true,
    },
    actions: {
      playerBid: assign({
        bid: (ctx, evt) => ({
          status: [...ctx.bid.status],
          // update bid at bidding player's index
          bids: ctx.bid.bids.map((bid, idx) =>
            idx == ctx.turn ? evt.value : bid
          ),
        }),
      }),
      playerFold: assign({
        bid: (ctx, _) => ({
          // update status at folding player's index
          status: ctx.bid.status.map((st, idx) =>
            idx == ctx.turn ? false : st
          ),
          bids: [...ctx.bid.bids],
        }),
      }),
      nextTurnBid: assign({
        turn: (ctx, _) => {
          let currentTurn = ctx.turn;
          // find the next player who has not dropped out of bidding
          while (true) {
            currentTurn = (currentTurn + 1) % 4;
            if (ctx.bid.status[currentTurn]) {
              break;
            }
          }
          return currentTurn;
        },
      }),
    },
  }
);

export default GameMachine;
