import { createMachine, assign, spawn, send, actions } from "xstate";
import Deck from "./Deck";

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
      turn: 0,
      bid: {
        status: [true, true, true, true],
        bids: [0, 0, 0, 0],
        bidWinner: null,
        winningBid: null,
      },
      play: {
        currentPlays: [],
        pastPlays: [],
        playerHands: [],
        trump: null,
      },
      game: {},
    },
    states: {
      pre_game: {
        on: {
          BEGIN_GAME: {
            target: "game_in_progress",
            actions: "dealCards",
          },
        },
      },
      game_in_progress: {
        id: "gameMachine",
        initial: "bid",
        type: "compound",
        states: {
          bid: {
            id: "bidMachine",
            initial: "awaiting_bid",
            entry: actions.log("starting bid", "[bid]"),
            states: {
              awaiting_bid: {
                entry: actions.log("awaiting next bid", "[bid]"),
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
                entry: actions.log(
                  (_, evt) =>
                    `bid turn executed, type: ${evt.type}, value: ${
                      // @ts-expect-error typing is weird here
                      evt.type == "BID" ? evt.value : null
                    }`,
                  "[bid]"
                ),
                always: [
                  {
                    target: "bid_winner",
                    cond: "isBiddingWon",
                  },
                  {
                    target: "awaiting_bid",
                    actions: "nextTurnBid",
                  },
                ],
              },
              bid_winner: {
                entry: [
                  actions.log<Context, GameEvents>(
                    (ctx, _) =>
                      `player ${ctx.turn} has won the bid at ${
                        ctx.bid.bids[ctx.turn]
                      }`,
                    "[bid]"
                  ),
                  "handleBidWinner",
                ],
                always: {
                  target: "#prePlayMachine.awaiting_trump",
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
                  TRUMP_CHOSEN: {
                    target: "meld_submission",
                    actions: "setTrump",
                  },
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
              { target: "bid", actions: "dealCards" },
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
      dealCards: assign({
        play: (ctx, _) => ({
          ...ctx.play,
          playerHands: Deck.getNewHands(),
        }),
      }),
      playerBid: assign({
        bid: (ctx, evt) => ({
          ...ctx.bid,
          // update bid at bidding player's index
          bids: ctx.bid.bids.map((bid, idx) =>
            idx == ctx.turn ? evt.value : bid
          ),
        }),
      }),
      playerFold: assign({
        bid: (ctx, _) => ({
          ...ctx.bid,
          // update status at folding player's index
          status: ctx.bid.status.map((st, idx) =>
            idx == ctx.turn ? false : st
          ),
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
      handleBidWinner: assign({
        bid: (ctx, _) => ({
          ...ctx.bid,
          // this is maybe a good place to somehow assert that our logic is in set
          // add an error state for logic (current turn, vs index of bid winner) being out of sync
          bidWinner: ctx.turn,
          winningBid: ctx.bid.bids[ctx.turn],
        }),
      }),
      setTrump: assign({
        play: (ctx, evt) => ({
          ...ctx.play,
          trump: evt.trump,
        }),
      }),
    },
  }
);

export default GameMachine;
