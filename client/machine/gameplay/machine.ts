import { createMachine, assign, actions } from "xstate";
import { sendParent } from "xstate/lib/actions";
import { createGameplayUpdate } from "../helpers";
import { WINNING_SCORE } from "./constants";
import Deck, { Suit } from "./Deck";
import { processIncomingPlayerEvent } from "./events";
import {
  getIsLastTrick,
  getNextPlayer,
  getPlayerTeam,
  getPlayPoints,
  getWinningPlay,
} from "./GameplayHelpers";
import { sumPlayerMelds } from "./Meld";

import { Context, GameEvents, Play } from "./types";

const GameMachine = createMachine(
  {
    preserveActionOrder: true,
    tsTypes: {} as import("./machine.typegen").Typegen0,
    schema: {
      context: {} as Context,
      events: {} as GameEvents,
    },
    id: "fullGameMachine",
    initial: "pre_game",
    type: "compound",
    context: {
      turn: 1,
      bid: {
        status: [true, true, true, true],
        bids: [0, 0, 0, 0],
        bidWinner: 0,
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
      game: {
        score: [0, 0],
        dealer: 0,
      },
    },
    states: {
      pre_game: {
        on: {
          BEGIN_GAME: {
            target: "game_in_progress",
            actions: ["announceGameStart", "announceTeams", "dealCards"],
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
            entry: [actions.log("starting bid", "[bid]"), "setStartingTurn"],
            states: {
              awaiting_bid: {
                entry: actions.log("awaiting next bid", "[bid]"),
                on: {
                  BID: {
                    target: "bid_choice_pseudostate",
                    actions: ["playerBid"],
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
                  PLAY_CARD: {
                    target: "pos_b",
                    actions: ["playCard", "nextTurnPlay"],
                  },
                },
              },
              pos_b: {
                on: {
                  PLAY_CARD: {
                    target: "pos_c",
                    actions: ["playCard", "nextTurnPlay"],
                  },
                },
              },
              pos_c: {
                on: {
                  PLAY_CARD: {
                    target: "pos_d",
                    actions: ["playCard", "nextTurnPlay"],
                  },
                },
              },
              pos_d: {
                on: {
                  PLAY_CARD: { target: "trick_end", actions: "playCard" },
                },
              },
              trick_end: {
                entry: ["tallyTrickPoints"],
                always: [
                  {
                    target: "#gameMachine.round_end_pseudo_state",
                    cond: "isPlayOver",
                  },
                  { target: "pos_a", actions: "newTrick" },
                ],
              },
            },
          },
          round_end_pseudo_state: {
            always: [
              {
                target: "round_end",
                actions: ["updateTeamScores"],
                cond: "didBidderMakeBid",
              },
              {
                target: "round_end",
                actions: ["handleBidNotMade"],
              },
            ],
          },
          round_end: {
            always: [
              {
                target: "#fullGameMachine.post_game",
                cond: "isGamePlayOver",
              },
              {
                target: "#gameMachine.bid",
                actions: ["resetRound", "changeDealer", "dealCards"],
              },
            ],
          },

          history: {
            type: "history",
            history: "deep",
          },
        },
      },
      post_game: {
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
    invoke: {
      src: () => (cb, onReceive) => {
        onReceive((e) => processIncomingPlayerEvent(e, cb));
      },
    },
    on: {
      FAILED_HEARTBEAT: { target: "failed_heartbeat" },
    },
  },
  {
    guards: {
      isBiddingWon: (ctx, _) => ctx.bid.status.filter((st) => st).length === 1,
      isGamePlayOver: (ctx, _) =>
        ctx.game.score.some((score) => score >= WINNING_SCORE),
      isPlayOver: (ctx, _) => getIsLastTrick(ctx.play.playerHands),
      didBidderMakeBid: (ctx, _) => {
        // safe to assert that bidWinner  both exist here
        const { bidWinner, bids } = ctx.bid;
        const bidWinnerPoints = ctx.round.points.reduce(
          (acc, curr) => acc + curr[getPlayerTeam(bidWinner)],
          0
        );
        return bidWinnerPoints >= bids[bidWinner];
      },
    },
    actions: {
      announceGameStart: sendParent(createGameplayUpdate("lobby.game_start")),
      dealCards: assign({
        play: (ctx, _) => ({
          ...ctx.play,
          playerHands: Deck.getNewHands(),
        }),
      }),
      playerBid: assign({
        bid: (ctx, evt) => {
          const updatedBids = ctx.bid.bids.map((bid, idx) =>
            idx == ctx.turn ? evt.value : bid
          );
          return {
            ...ctx.bid,
            // update bid at bidding player's index
            bids: updatedBids,
            bidWinner: updatedBids.indexOf(Math.max(...updatedBids)), // set the winner to be whatever is the highest
          };
        },
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
            currentTurn = getNextPlayer(currentTurn);
            if (ctx.bid.status[currentTurn]) {
              break;
            }
          }
          return currentTurn;
        },
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
        melds: (ctx, evt) => {
          const { player } = evt;
          return ctx.melds.map((entry, idx) => (idx === player ? [] : entry));
        },
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
      playCard: assign({
        play: (ctx, evt) => {
          const { player, key } = evt;
          return {
            ...ctx.play,
            currentPlays: [...ctx.play.currentPlays, { key, player }],
            playerHands: ctx.play.playerHands.map((hand, idx) => {
              if (idx === player) {
                return hand.filter((card) => card !== key);
              }
              return hand;
            }),
          };
        },
      }),
      nextTurnPlay: assign({
        turn: (ctx, _) => getNextPlayer(ctx.turn),
      }),
      tallyTrickPoints: assign({
        round: (ctx, _) => {
          const { currentPlays, trump } = ctx.play;
          const { player: winningPlayer } = getWinningPlay(
            currentPlays,
            // basically asserting that trump will be defined by this point
            trump as Suit
          );
          const isLastTrick = getIsLastTrick(ctx.play.playerHands);
          return {
            points: ctx.round.points.map((teamPoints, idx) =>
              idx === getPlayerTeam(winningPlayer)
                ? [
                    teamPoints[0],
                    teamPoints[1] +
                      getPlayPoints(ctx.play.currentPlays, isLastTrick),
                  ]
                : teamPoints
            ),
          };
        },
      }),
      newTrick: assign({
        // trick winner starts next round of play
        turn: (ctx, _) => {
          const { currentPlays, trump } = ctx.play;
          const { player: winningPlayer } = getWinningPlay(
            currentPlays,
            // basically asserting that trump will be defined by this point
            trump as Suit
          );
          return winningPlayer;
        },
        // reset the board
        play: (ctx, _) => ({
          ...ctx.play,
          currentPlays: [],
          pastPlays: [...ctx.play.pastPlays, ctx.play.currentPlays],
        }),
      }),
      handleBidNotMade: assign({
        game: (ctx, _) => ({
          ...ctx.game,
          // basically assert that bidwinner and winning bid are defined here
          score: ctx.game.score.map((score, idx) =>
            idx === getPlayerTeam(ctx.bid.bidWinner)
              ? score - ctx.bid.bids[ctx.bid.bidWinner]
              : score + ctx.round.points[idx][0] + ctx.round.points[idx][1]
          ),
        }),
      }),
      // updates scores of both teams
      updateTeamScores: assign({
        game: (ctx, _) => {
          return {
            ...ctx.game,
            score: ctx.game.score.map(
              (score, idx) =>
                score + ctx.round.points[idx][0] + ctx.round.points[idx][1] // sum up the melds and play points
            ),
          };
        },
      }),
      resetRound: assign({
        play: (_ctx, _) => ({
          // for some reason the params need to be in the function here
          currentPlays: [],
          pastPlays: [],
          playerHands: [],
          trump: null,
        }),
        bid: (_ctx, _) => ({
          status: [true, true, true, true],
          bids: [0, 0, 0, 0],
          bidWinner: 0,
        }),
        melds: (_ctx, _) => [[], [], [], []],
        round: (_ctx, _) => ({
          points: [
            [0, 0],
            [0, 0],
          ],
        }),
      }),
      changeDealer: assign({
        game: (ctx, _) => ({
          ...ctx.game,
          dealer: getNextPlayer(ctx.game.dealer),
        }),
      }),
      setStartingTurn: assign({
        turn: (ctx, _) => getNextPlayer(ctx.game.dealer),
      }),
    },
  }
);

export default GameMachine;
