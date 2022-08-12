import { createMachine, assign, actions } from "xstate";
import { sendParent, pure, log } from "xstate/lib/actions";
import { createGameplayUpdate } from "./events";
import { WINNING_SCORE } from "./constants";
import Deck, { Suit } from "./Deck";
import {
  allButPlayer,
  didBidderMakeBid,
  getIsLastTrick,
  getNextPlayer,
  getPlayerTeam,
  getPlayPoints,
  getWinningPlay,
  isGamePlayOver,
} from "./GameplayHelpers";
import { getMeldPoints } from "./Meld";

import { GameplayContext, GameEvents, Play } from "./types";

const GameMachine = createMachine(
  {
    preserveActionOrder: true,
    tsTypes: {} as import("./machine.typegen").Typegen0,
    schema: {
      context: {} as GameplayContext,
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
      meld: [[], [], [], []],
      play: {
        winning_player: null,
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
          START_GAME: {
            target: "round_in_progress",
            actions: "sendGameStart",
          },
        },
      },
      round_in_progress: {
        id: "roundMachine",
        initial: "round_start_epsilon",
        type: "compound",
        states: {
          round_start_epsilon: {
            always: {
              target: "bid",
              actions: ["sendRoundStart", "dealCards", "sendCards"],
            },
          },
          bid: {
            id: "bidMachine",
            initial: "awaiting_bid",
            entry: [log("starting bid", "[gameplay]"), "setStartingTurn"],
            states: {
              awaiting_bid: {
                entry: [
                  log("awaiting next bid", "[gameplay]"),
                  "promptPlayerBid",
                ],
                on: {
                  BID: {
                    target: "bid_choice_pseudostate",
                    actions: ["playerBid", "sendPlayerBid"],
                  },
                  FOLD: {
                    target: "bid_choice_pseudostate",
                    actions: ["playerFold", "sendPlayerFold"],
                  },
                },
              },
              // choice pseudostate for either continuing with bid or declaring winner
              bid_choice_pseudostate: {
                entry: [
                  (ctx, evt) =>
                    log(
                      `bid turn executed by player ${ctx.turn}, type: ${
                        evt.type
                      }, value: ${evt.type == "BID" ? evt.value : null}`,
                      "[gameplay]"
                    ),
                ],
                always: [
                  {
                    target: "bid_winner",
                    cond: "isBiddingWon",
                    actions: ["nextTurnBid"], // person who remains is the winner
                  },
                  {
                    target: "awaiting_bid",
                    actions: ["nextTurnBid"], // go to next person still in the game
                  },
                ],
              },
              bid_winner: {
                entry: [
                  (ctx, evt) =>
                    log(
                      `player ${ctx.turn} has won the bid at ${
                        ctx.bid.bids[ctx.turn]
                      }`,
                      "[gameplay]"
                    ),
                  "sendBidWinner",
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
                entry: [
                  (ctx) =>
                    log(
                      `awaiting player ${ctx.turn} to choose trump`,
                      "[gameplay]"
                    ),
                  "promptTrumpChoice",
                ],
                on: {
                  TRUMP_CHOSEN: {
                    target: "meld_submission",
                    actions: ["setTrump", "sendTrumpChosen"],
                  },
                },
              },
              meld_submission: {
                id: "meldSubmissionMachine",
                entry: [
                  (ctx, evt) => log(`meld submission phase`, "[gameplay]"),
                  "promptMeldSubmission",
                ],
                initial: "no_submit",
                states: {
                  no_submit: {
                    entry: (ctx, evt) =>
                      log(`awaiting first meld`, "[gameplay]"),
                    on: {
                      COMMIT_MELDS: {
                        target: "one_submit",
                        actions: "sendCommitMelds",
                      },
                    },
                  },
                  one_submit: {
                    entry: (ctx, evt) =>
                      log(`awaiting second meld`, "[gameplay]"),
                    on: {
                      COMMIT_MELDS: {
                        target: "two_submit",
                        actions: "sendCommitMelds",
                      },
                    },
                  },
                  two_submit: {
                    entry: (ctx, evt) =>
                      log(`awaiting third meld`, "[gameplay]"),
                    on: {
                      COMMIT_MELDS: {
                        target: "three_submit",
                        actions: "sendCommitMelds",
                      },
                    },
                  },
                  three_submit: {
                    entry: (ctx, evt) =>
                      log(`awaiting fourth meld`, "[gameplay]"),
                    on: {
                      COMMIT_MELDS: {
                        target: "#playMachine",
                        actions: "sendCommitMelds",
                      },
                    },
                  },
                },
                on: {
                  ADD_MELD: {
                    actions: ["addMeld", "sendAddMeld"],
                  },
                },
              },
            },
          },
          play: {
            id: "playMachine",
            entry: ["sendPlayStart", "promptPlayTurn"],
            initial: "pos_a",
            states: {
              pos_a: {
                on: {
                  PLAY_CARD: {
                    target: "pos_b",
                    actions: [
                      "playCard",
                      "sendPlayerPlayCard",
                      "nextTurnPlay",
                      "promptPlayTurn",
                    ],
                  },
                },
              },
              pos_b: {
                on: {
                  PLAY_CARD: {
                    target: "pos_c",
                    actions: [
                      "playCard",
                      "sendPlayerPlayCard",
                      "nextTurnPlay",
                      "promptPlayTurn",
                    ],
                  },
                },
              },
              pos_c: {
                on: {
                  PLAY_CARD: {
                    target: "pos_d",
                    actions: [
                      "playCard",
                      "sendPlayerPlayCard",
                      "nextTurnPlay",
                      "promptPlayTurn",
                    ],
                  },
                },
              },
              pos_d: {
                on: {
                  PLAY_CARD: {
                    target: "trick_end",
                    actions: ["playCard", "sendPlayerPlayCard"],
                  },
                },
              },
              trick_end: {
                entry: ["saveTrickWinner", "tallyTrickPoints", "sendTrickEnd"],
                always: [
                  {
                    target: "#roundMachine.round_end_pseudo_state",
                    cond: "isPlayOver",
                  },
                  {
                    target: "pos_a",
                    actions: ["newTrick", "promptPlayTurn"],
                  },
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
                target: "#roundMachine",
                actions: ["sendRoundStats", "resetRound", "changeDealer"],
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
          NEW_GAME: { target: "pre_game" },
        },
      },
      failed_heartbeat: {
        on: {
          RESUMED_HEARTBEAT: { target: "round_in_progress.history" },
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
      isPlayOver: (ctx, _) => getIsLastTrick(ctx.play.playerHands),
      isGamePlayOver,
      didBidderMakeBid,
    },
    actions: {
      dealCards: assign({
        play: (ctx, _) => ({
          ...ctx.play,
          playerHands: Deck.getNewHands(),
        }),
      }),
      sendGameStart: sendParent(createGameplayUpdate("lobby.game_start")),
      sendRoundStart: sendParent((ctx) =>
        createGameplayUpdate("gameplay.pre_play.round_start", null, {
          // we send player here to make consistent how we refer to players
          player: ctx.game.dealer,
        })
      ),
      sendCards: pure((ctx) =>
        ctx.play.playerHands.map((hand, idx) =>
          sendParent(
            createGameplayUpdate("gameplay.player_cards", [idx], { hand })
          )
        )
      ),
      promptPlayerBid: sendParent((ctx) =>
        createGameplayUpdate("gameplay.bid.awaiting_bid", null, {
          player: ctx.turn,
        })
      ),
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
      sendPlayerBid: sendParent((ctx, evt) =>
        createGameplayUpdate(
          "gameplay.bid.player_bid",
          allButPlayer(ctx.turn),
          {
            player: ctx.turn,
            bid: evt.value,
          }
        )
      ),
      playerFold: assign({
        bid: (ctx, _) => ({
          ...ctx.bid,
          // update status at folding player's index
          status: ctx.bid.status.map((st, idx) =>
            idx == ctx.turn ? false : st
          ),
        }),
      }),
      sendPlayerFold: sendParent((ctx, evt) =>
        createGameplayUpdate(
          "gameplay.bid.player_fold",
          allButPlayer(ctx.turn),
          {
            player: ctx.turn,
          }
        )
      ),
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
      sendBidWinner: sendParent((ctx) =>
        createGameplayUpdate("gameplay.bid.bid_winner", null, {
          player: ctx.turn,
        })
      ),
      promptTrumpChoice: sendParent((ctx) =>
        createGameplayUpdate("gameplay.pre_play.trump_choosing", null, {
          player: ctx.turn,
        })
      ),
      setTrump: assign({
        play: (ctx, evt) => ({
          ...ctx.play,
          trump: evt.trump,
        }),
      }),
      sendTrumpChosen: sendParent((ctx, evt) =>
        createGameplayUpdate(
          "gameplay.pre_play.trump_chosen",
          allButPlayer(ctx.turn),
          { trump: evt.trump }
        )
      ),
      promptMeldSubmission: sendParent(() =>
        createGameplayUpdate("gameplay.pre_play.awaiting_melds")
      ),
      addMeld: assign({
        // To do: think about rejecting invalid meld, and about preventing
        // duplicate meld
        // save player's meld, update points for the team
        meld: (ctx, evt) => {
          const { meld, player } = evt;
          return ctx.meld.map((entry, idx) =>
            idx === player ? [...entry, meld] : entry
          );
        },
        round: (ctx, evt) => {
          const { player, meld } = evt;
          return {
            points: ctx.round.points.map((points, idx) => {
              return idx === getPlayerTeam(player)
                ? [
                    points[0] + getMeldPoints(meld),
                    points[1], // points[0] are meld points, points[1] are play points
                  ]
                : points;
            }),
          };
        },
      }),
      sendAddMeld: sendParent((ctx, evt) =>
        createGameplayUpdate(
          "gameplay.pre_play.player_meld_added",
          allButPlayer(evt.player),
          { meld: evt.meld, player: evt.player, points: ctx.round.points }
        )
      ),
      sendCommitMelds: sendParent((ctx, evt) =>
        createGameplayUpdate(
          "gameplay.pre_play.player_melds_committed",
          allButPlayer(evt.player),
          { player: evt.player }
        )
      ),
      sendPlayStart: sendParent((ctx, evt) =>
        createGameplayUpdate("gameplay.play.play_start", null)
      ),
      promptPlayTurn: sendParent((ctx, evt) =>
        createGameplayUpdate("gameplay.play.player_turn", null, {
          player: ctx.turn,
        })
      ),
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
      sendPlayerPlayCard: sendParent((ctx, evt) =>
        createGameplayUpdate(
          "gameplay.play.player_play_card",
          allButPlayer(evt.player),
          { player: evt.player, card: evt.key }
        )
      ),
      nextTurnPlay: assign({
        turn: (ctx, _) => getNextPlayer(ctx.turn),
      }),
      saveTrickWinner: assign({
        play: (ctx, _) => {
          const { currentPlays, trump } = ctx.play;
          const { player: winningPlayer } = getWinningPlay(
            currentPlays,
            // basically asserting that trump will be defined by this point
            trump as Suit
          );
          return {
            ...ctx.play,
            winning_player: winningPlayer,
          };
        },
      }),
      tallyTrickPoints: assign({
        round: (ctx, _) => {
          const {
            playerHands,
            currentPlays,
            winning_player: winningPlayer,
          } = ctx.play;
          const isLastTrick = getIsLastTrick(playerHands);
          return {
            points: ctx.round.points.map((teamPoints, idx) =>
              // @ts-expect-error safe to assume winningPlayer will be not null here
              idx === getPlayerTeam(winningPlayer)
                ? [
                    teamPoints[0],
                    teamPoints[1] + getPlayPoints(currentPlays, isLastTrick),
                  ]
                : teamPoints
            ),
          };
        },
      }),
      sendTrickEnd: sendParent((ctx, evt) => {
        return createGameplayUpdate("gameplay.play.trick_end", null, {
          winning_player: ctx.play.winning_player,
          points: ctx.round.points,
          is_last_trick: getIsLastTrick(ctx.play.playerHands),
        });
      }),
      sendRoundStats: sendParent((ctx, evt) =>
        createGameplayUpdate("gameplay.post_play.round_end", null, {
          score: ctx.game.score,
          has_made_bid: didBidderMakeBid(ctx),
          game_over: isGamePlayOver(ctx),
        })
      ),
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
          winning_player: null,
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
                score + ctx.round.points[idx][0] + ctx.round.points[idx][1] // sum up the meld and play points
            ),
          };
        },
      }),
      resetRound: assign({
        play: (_ctx, _) => ({
          // for some reason the params need to be in the function here
          winning_player: null,
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
        meld: (_ctx, _) => [[], [], [], []],
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
