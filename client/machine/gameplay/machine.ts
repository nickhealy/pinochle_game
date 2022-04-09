import { createMachine, assign, spawn, send, actions } from "xstate";
import Deck from "./Deck";
import { getPlayerTeam } from "./GameplayHelpers";
import { sumPlayerMelds } from "./Meld";

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
      melds: [[], [], [], []],
      play: {
        currentPlays: [],
        pastPlays: [],
        playerHands: [],
        trump: null,
      },
      round: {
        points: [
          [0, 0],
          [0, 0],
        ],
      },
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
                id: "meldSubmissionMachine",
                initial: "no_submit",
                states: {
                  no_submit: {
                    on: {
                      SUBMIT_MELDS: {
                        target: "one_submit",
                        actions: "submitMeld",
                      },
                    },
                  },
                  one_submit: {
                    on: {
                      SUBMIT_MELDS: {
                        target: "two_submit",
                        actions: "submitMeld",
                      },
                      EDIT_MELD: {
                        target: "no_submit",
                        actions: "editMeld",
                      },
                    },
                  },
                  two_submit: {
                    on: {
                      SUBMIT_MELDS: {
                        target: "three_submit",
                        actions: "submitMeld",
                      },
                      EDIT_MELD: {
                        target: "one_submit",
                        actions: "editMeld",
                      },
                    },
                  },
                  three_submit: {
                    on: {
                      SUBMIT_MELDS: {
                        target: "#prePlayMachine.ready_confirm",
                        actions: "submitMeld",
                      },
                      EDIT_MELD: {
                        target: "two_submit",
                        actions: "editMeld",
                      },
                    },
                  },
                },
              },
              ready_confirm: {
                initial: "zero_confirm",
                states: {
                  zero_confirm: {
                    on: {
                      PLAYER_READY: {
                        target: "one_confirm",
                      },
                    },
                  },
                  one_confirm: {
                    on: {
                      PLAYER_READY: {
                        target: "two_confirm",
                      },
                    },
                  },
                  two_confirm: {
                    on: {
                      PLAYER_READY: {
                        target: "three_confirm",
                      },
                    },
                  },
                  three_confirm: {
                    on: {
                      PLAYER_READY: {
                        target: "#playMachine",
                      },
                    },
                  },
                },
                on: {
                  PLAYER_REJECT: {
                    target: "#meldSubmissionMachine.three_submit",
                    actions: "editMeld",
                  },
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
              { target: "#gameMachine.bid", actions: "dealCards" },
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
      // allPlayersReady: () => true,
      isGamePlayOver: () => true,
      // allMeldsSubmitted: () => true,
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
      submitMeld: assign({
        // To do: think about rejecting invalid melds, and about preventing
        // duplicate melds
        // save player's melds, update points for the team
        melds: (ctx, evt) => {
          const { melds, player } = evt;
          return ctx.melds.map((entry, idx) =>
            idx === player ? melds : entry
          );
        },
        round: (ctx, evt) => {
          const { player, melds } = evt;
          return {
            points: ctx.round.points.map((points, idx) => {
              return idx === getPlayerTeam(player)
                ? [
                    points[0] + sumPlayerMelds(melds),
                    points[1], // points[0] are meld points, points[1] are play points
                  ]
                : points;
            }),
          };
        },
      }),
      editMeld: assign({
        round: (ctx, evt) => {
          const { player } = evt;
          const playerMelds = ctx.melds[player];
          return {
            points: ctx.round.points.map((points, idx) => {
              return idx === getPlayerTeam(player)
                ? [
                    points[0] - sumPlayerMelds(playerMelds),
                    points[1], // points[0] are meld points, points[1] are play points
                  ]
                : points;
            }),
          };
        },
      }),
    },
  }
);

export default GameMachine;
