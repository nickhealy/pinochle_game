import { mockRandom } from "jest-mock-random";
import { interpret } from "xstate";
import ConnectionSupervisorMachine from "../ConnectionSupervisor/machine";
import { getTestClient } from "../networking/__tests__/mockClient";

jest.mock("../gameplay/Deck");
jest.mock("../networking/webrtc");
jest.mock("../../inversify.config");

describe("integration test", () => {
  beforeAll(() => {
    mockRandom([0.9, 0.7, 0.3, 0.1]);
  });

  it(
    "gameplay",
    async () => {
      const [player0] = getTestClient();
      const [player1] = getTestClient();
      const [player2] = getTestClient();
      const [player3] = getTestClient();

      const supervisorService = interpret(ConnectionSupervisorMachine);
      supervisorService.start();

      // they join game in reverse order so when they are "randomly"
      // assigned teams (in reverse order), their ids for the tests (player0, 1, 2, 3)
      // correspond to their ids in the game machine

      supervisorService.send({
        type: "PLAYER_JOIN_REQUEST",
        connection_info: player3.metadata,
        name: "chris",
      });
      supervisorService.send({
        type: "PLAYER_JOIN_REQUEST",
        connection_info: player2.metadata,
        name: "scott",
      });
      supervisorService.send({
        type: "PLAYER_JOIN_REQUEST",
        connection_info: player1.metadata,
        name: "annabelle",
      });
      supervisorService.send({
        type: "PLAYER_JOIN_REQUEST",
        connection_info: player0.metadata,
        name: "nick",
      });

      await player0.waitForMessage("lobby.all_players_connected");

      player3.send(
        JSON.stringify({
          event: "lobby.start_game",
        })
      );

      // getting teams
      const teams = [
        [player0.id, player2.id],
        [player1.id, player3.id],
      ];
      await player0.waitForMessage("lobby.player_teams", { teams });
      await player1.waitForMessage("lobby.player_teams", { teams });
      await player2.waitForMessage("lobby.player_teams", { teams });
      await player3.waitForMessage("lobby.player_teams", { teams });

      // game start
      await player0.waitForMessage("lobby.game_start");
      await player1.waitForMessage("lobby.game_start");
      await player2.waitForMessage("lobby.game_start");
      await player3.waitForMessage("lobby.game_start");

      // round start
      await player0.waitForMessage("gameplay.pre_play.round_start", {
        player: player0.id,
      });
      await player1.waitForMessage("gameplay.pre_play.round_start", {
        player: player0.id,
      });
      await player2.waitForMessage("gameplay.pre_play.round_start", {
        player: player0.id,
      });
      await player3.waitForMessage("gameplay.pre_play.round_start", {
        player: player0.id,
      });

      // send cards to each player
      await player0.waitForMessage("gameplay.player_cards", {
        hand: [
          "9C",
          "AC",
          "JC",
          "10C",
          "KD",
          "JD",
          "QH",
          "JH",
          "KS",
          "QS",
          "AS",
          "10S",
        ],
      });
      await player1.waitForMessage("gameplay.player_cards", {
        hand: [
          "10C",
          "KC",
          "QC",
          "KC",
          "QD",
          "10D",
          "9D",
          "AH",
          "9H",
          "QS",
          "AS",
          "10S",
        ],
      });
      await player2.waitForMessage("gameplay.player_cards", {
        hand: [
          "QC",
          "JC",
          "AC",
          "JD",
          "QD",
          "9D",
          "10D",
          "QH",
          "10H",
          "AH",
          "KH",
          "9S",
        ],
      });
      await player3.waitForMessage("gameplay.player_cards", {
        hand: [
          "9C",
          "AD",
          "AD",
          "KD",
          "KH",
          "9H",
          "JH",
          "10H",
          "KS",
          "JS",
          "9S",
          "JS",
        ],
      });

      await player0.waitForMessage("gameplay.bid.awaiting_bid", {
        player: player1.id,
      });
      await player1.waitForMessage("gameplay.bid.awaiting_bid", {
        player: player1.id,
      });
      await player2.waitForMessage("gameplay.bid.awaiting_bid", {
        player: player1.id,
      });
      await player3.waitForMessage("gameplay.bid.awaiting_bid", {
        player: player1.id,
      });

      // player @ index 1 (scott's) turn to make a bid
      player1.send(
        JSON.stringify({
          event: "gameplay.bid.player_bid",
          data: { value: 140 },
        })
      );

      await player0.waitForMessage("gameplay.bid.player_bid", {
        player: player1.id,
        bid: 140,
      });
      await player2.waitForMessage("gameplay.bid.player_bid", {
        player: player1.id,
        bid: 140,
      });
      await player3.waitForMessage("gameplay.bid.player_bid", {
        player: player1.id,
        bid: 140,
      });

      await player0.waitForMessage("gameplay.bid.awaiting_bid", {
        player: player2.id,
      });
      await player1.waitForMessage("gameplay.bid.awaiting_bid", {
        player: player2.id,
      });
      await player2.waitForMessage("gameplay.bid.awaiting_bid", {
        player: player2.id,
      });
      await player3.waitForMessage("gameplay.bid.awaiting_bid", {
        player: player2.id,
      });

      player2.send(
        JSON.stringify({
          event: "gameplay.bid.player_bid",
          data: { value: 150 },
        })
      );

      await player0.waitForMessage("gameplay.bid.player_bid", {
        player: player2.id,
        bid: 150,
      });
      await player1.waitForMessage("gameplay.bid.player_bid", {
        player: player2.id,
        bid: 150,
      });
      await player3.waitForMessage("gameplay.bid.player_bid", {
        player: player2.id,
        bid: 150,
      });

      await player0.waitForMessage("gameplay.bid.awaiting_bid", {
        player: player3.id,
      });
      await player1.waitForMessage("gameplay.bid.awaiting_bid", {
        player: player3.id,
      });
      await player2.waitForMessage("gameplay.bid.awaiting_bid", {
        player: player3.id,
      });
      await player3.waitForMessage("gameplay.bid.awaiting_bid", {
        player: player3.id,
      });

      player3.send(
        JSON.stringify({
          event: "gameplay.bid.player_fold",
        })
      );

      await player0.waitForMessage("gameplay.bid.player_fold", {
        player: player3.id,
      });
      await player1.waitForMessage("gameplay.bid.player_fold", {
        player: player3.id,
      });
      await player2.waitForMessage("gameplay.bid.player_fold", {
        player: player3.id,
      });

      await player0.waitForMessage("gameplay.bid.awaiting_bid", {
        player: player0.id,
      });
      await player1.waitForMessage("gameplay.bid.awaiting_bid", {
        player: player0.id,
      });
      await player2.waitForMessage("gameplay.bid.awaiting_bid", {
        player: player0.id,
      });
      await player3.waitForMessage("gameplay.bid.awaiting_bid", {
        player: player0.id,
      });

      player0.send(
        JSON.stringify({
          event: "gameplay.bid.player_bid",
          data: { value: 160 },
        })
      );

      await player1.waitForMessage("gameplay.bid.player_bid", {
        player: player0.id,
        bid: 160,
      });
      await player2.waitForMessage("gameplay.bid.player_bid", {
        player: player0.id,
        bid: 160,
      });
      await player3.waitForMessage("gameplay.bid.player_bid", {
        player: player0.id,
        bid: 160,
      });

      await player0.waitForMessage("gameplay.bid.awaiting_bid", {
        player: player1.id,
      });
      await player1.waitForMessage("gameplay.bid.awaiting_bid", {
        player: player1.id,
      });
      await player2.waitForMessage("gameplay.bid.awaiting_bid", {
        player: player1.id,
      });
      await player3.waitForMessage("gameplay.bid.awaiting_bid", {
        player: player1.id,
      });

      player1.send(
        JSON.stringify({
          event: "gameplay.bid.player_fold",
        })
      );

      await player0.waitForMessage("gameplay.bid.player_fold", {
        player: player1.id,
      });
      await player2.waitForMessage("gameplay.bid.player_fold", {
        player: player1.id,
      });
      await player3.waitForMessage("gameplay.bid.player_fold", {
        player: player1.id,
      });

      await player0.waitForMessage("gameplay.bid.awaiting_bid", {
        player: player2.id,
      });
      await player1.waitForMessage("gameplay.bid.awaiting_bid", {
        player: player2.id,
      });
      await player2.waitForMessage("gameplay.bid.awaiting_bid", {
        player: player2.id,
      });
      await player3.waitForMessage("gameplay.bid.awaiting_bid", {
        player: player2.id,
      });

      player2.send(
        JSON.stringify({
          event: "gameplay.bid.player_fold",
        })
      );

      await player0.waitForMessage("gameplay.bid.player_fold", {
        player: player2.id,
      });
      await player1.waitForMessage("gameplay.bid.player_fold", {
        player: player2.id,
      });
      await player3.waitForMessage("gameplay.bid.player_fold", {
        player: player2.id,
      });

      await player0.waitForMessage("gameplay.bid.bid_winner", {
        player: player0.id,
      });
      await player1.waitForMessage("gameplay.bid.bid_winner", {
        player: player0.id,
      });
      await player2.waitForMessage("gameplay.bid.bid_winner", {
        player: player0.id,
      });
      await player3.waitForMessage("gameplay.bid.bid_winner", {
        player: player0.id,
      });

      await player0.waitForMessage("gameplay.pre_play.trump_choosing", {
        player: player0.id,
      });
      await player1.waitForMessage("gameplay.pre_play.trump_choosing", {
        player: player0.id,
      });
      await player2.waitForMessage("gameplay.pre_play.trump_choosing", {
        player: player0.id,
      });
      await player3.waitForMessage("gameplay.pre_play.trump_choosing", {
        player: player0.id,
      });

      player0.send(
        JSON.stringify({
          event: "gameplay.pre_play.trump_chosen",
          data: { trump: "spades" },
        })
      );

      await player1.waitForMessage("gameplay.pre_play.trump_chosen", {
        trump: "spades",
      });
      await player2.waitForMessage("gameplay.pre_play.trump_chosen", {
        trump: "spades",
      });
      await player3.waitForMessage("gameplay.pre_play.trump_chosen", {
        trump: "spades",
      });

      await player0.waitForMessage("gameplay.pre_play.awaiting_melds");
      await player1.waitForMessage("gameplay.pre_play.awaiting_melds");
      await player2.waitForMessage("gameplay.pre_play.awaiting_melds");
      await player3.waitForMessage("gameplay.pre_play.awaiting_melds");

      // meld submission

      // player 0 thinks he only has a royal marriage, he forgets the pinochle he has elsewhere in his hand
      player0.send(
        JSON.stringify({
          event: "gameplay.pre_play.player_add_meld",
          data: {
            player: player0.id,
            meld: {
              type: "royal-marriage",
              cards: ["KS", "QS"],
            },
          },
        })
      );

      await player1.waitForMessage("gameplay.pre_play.player_meld_added", {
        meld: {
          type: "royal-marriage",
          cards: ["KS", "QS"],
        },

        player: player0.id,
        points: [
          [40, 0],
          [0, 0],
        ],
      });
      await player2.waitForMessage("gameplay.pre_play.player_meld_added", {
        meld: {
          type: "royal-marriage",
          cards: ["KS", "QS"],
        },
        player: player0.id,
        points: [
          [40, 0],
          [0, 0],
        ],
      });
      await player3.waitForMessage("gameplay.pre_play.player_meld_added", {
        meld: {
          type: "royal-marriage",
          cards: ["KS", "QS"],
        },
        player: player0.id,
        points: [
          [40, 0],
          [0, 0],
        ],
      });

      // player1 only has a marriage, but they will take a moment to double check their hand before confirming
      player1.send(
        JSON.stringify({
          event: "gameplay.pre_play.player_add_meld",
          data: {
            player: player1.id,
            meld: {
              type: "marriage",
              cards: ["KC", "QC"],
            },
          },
        })
      );

      await player0.waitForMessage("gameplay.pre_play.player_meld_added", {
        meld: {
          type: "marriage",
          cards: ["KC", "QC"],
        },
        player: player1.id,
        points: [
          [40, 0],
          [20, 0],
        ],
      });
      await player2.waitForMessage("gameplay.pre_play.player_meld_added", {
        meld: {
          type: "marriage",
          cards: ["KC", "QC"],
        },
        player: player1.id,
        points: [
          [40, 0],
          [20, 0],
        ],
      });
      await player3.waitForMessage("gameplay.pre_play.player_meld_added", {
        meld: {
          type: "marriage",
          cards: ["KC", "QC"],
        },
        player: player1.id,
        points: [
          [40, 0],
          [20, 0],
        ],
      });

      // player 2 only has 9 trump and is certain of it, so he submits shortly after adding his melds
      player2.send(
        JSON.stringify({
          event: "gameplay.pre_play.player_add_meld",
          data: {
            player: player2.id,
            meld: {
              type: "trump-nine",
              cards: ["9S"],
            },
          },
        })
      );

      player2.send(
        JSON.stringify({
          event: "gameplay.pre_play.player_commit_melds",
          data: {
            player: player2.id,
          },
        })
      );

      // players receive messages of player2's melds
      await player0.waitForMessage("gameplay.pre_play.player_meld_added", {
        meld: {
          type: "trump-nine",
          cards: ["9S"],
        },
        player: player2.id,
        points: [
          [50, 0],
          [20, 0],
        ],
      });
      await player1.waitForMessage("gameplay.pre_play.player_meld_added", {
        meld: {
          type: "trump-nine",
          cards: ["9S"],
        },
        player: player2.id,
        points: [
          [50, 0],
          [20, 0],
        ],
      });
      await player3.waitForMessage("gameplay.pre_play.player_meld_added", {
        meld: {
          type: "trump-nine",
          cards: ["9S"],
        },
        player: player2.id,
        points: [
          [50, 0],
          [20, 0],
        ],
      });

      //...and then they receive messages that he committed them
      await player0.waitForMessage("gameplay.pre_play.player_melds_committed", {
        player: player2.id,
      });
      await player1.waitForMessage("gameplay.pre_play.player_melds_committed", {
        player: player2.id,
      });
      await player3.waitForMessage("gameplay.pre_play.player_melds_committed", {
        player: player2.id,
      });

      // player0 now remembers he has a pinochle
      player0.send(
        JSON.stringify({
          event: "gameplay.pre_play.player_add_meld",
          data: {
            player: player0.id,
            meld: {
              type: "pinochle",
              cards: ["QS", "JD"],
            },
          },
        })
      );

      await player1.waitForMessage("gameplay.pre_play.player_meld_added", {
        meld: {
          type: "pinochle",
          cards: ["QS", "JD"],
        },
        player: player0.id,
        points: [
          [90, 0],
          [20, 0],
        ],
      });
      await player2.waitForMessage("gameplay.pre_play.player_meld_added", {
        meld: {
          type: "pinochle",
          cards: ["QS", "JD"],
        },
        player: player0.id,
        points: [
          [90, 0],
          [20, 0],
        ],
      });
      await player3.waitForMessage("gameplay.pre_play.player_meld_added", {
        meld: {
          type: "pinochle",
          cards: ["QS", "JD"],
        },
        player: player0.id,
        points: [
          [90, 0],
          [20, 0],
        ],
      });

      // ... and signals he is finished
      player0.send(
        JSON.stringify({
          event: "gameplay.pre_play.player_commit_melds",
          data: {
            player: player0.id,
          },
        })
      );

      // player1 commits melds at same time
      player0.send(
        JSON.stringify({
          event: "gameplay.pre_play.player_commit_melds",
          data: {
            player: player1.id,
          },
        })
      );

      await player1.waitForMessage("gameplay.pre_play.player_melds_committed", {
        player: player0.id,
      });
      await player2.waitForMessage("gameplay.pre_play.player_melds_committed", {
        player: player0.id,
      });
      await player3.waitForMessage("gameplay.pre_play.player_melds_committed", {
        player: player0.id,
      });

      await player0.waitForMessage("gameplay.pre_play.player_melds_committed", {
        player: player1.id,
      });
      await player2.waitForMessage("gameplay.pre_play.player_melds_committed", {
        player: player1.id,
      });
      await player3.waitForMessage("gameplay.pre_play.player_melds_committed", {
        player: player1.id,
      });

      // player3 submits his 9 trump
      player3.send(
        JSON.stringify({
          event: "gameplay.pre_play.player_add_meld",
          data: {
            player: player3.id,
            meld: {
              type: "trump-nine",
              cards: ["9S"],
            },
          },
        })
      );

      await player0.waitForMessage("gameplay.pre_play.player_meld_added", {
        meld: {
          type: "trump-nine",
          cards: ["9S"],
        },
        player: player3.id,
        points: [
          [90, 0],
          [30, 0],
        ],
      });
      await player1.waitForMessage("gameplay.pre_play.player_meld_added", {
        meld: {
          type: "trump-nine",
          cards: ["9S"],
        },
        player: player3.id,
        points: [
          [90, 0],
          [30, 0],
        ],
      });
      await player2.waitForMessage("gameplay.pre_play.player_meld_added", {
        meld: {
          type: "trump-nine",
          cards: ["9S"],
        },
        player: player3.id,
        points: [
          [90, 0],
          [30, 0],
        ],
      });

      player3.send(
        JSON.stringify({
          event: "gameplay.pre_play.player_commit_melds",
          data: {
            player: player3.id,
          },
        })
      );

      await player0.waitForMessage("gameplay.pre_play.player_melds_committed", {
        player: player3.id,
      });
      await player1.waitForMessage("gameplay.pre_play.player_melds_committed", {
        player: player3.id,
      });
      await player2.waitForMessage("gameplay.pre_play.player_melds_committed", {
        player: player3.id,
      });

      await player0.waitForMessage("gameplay.play.play_start");
      await player1.waitForMessage("gameplay.play.play_start");
      await player2.waitForMessage("gameplay.play.play_start");
      await player3.waitForMessage("gameplay.play.play_start");

      // the play

      // round one

      // player 0 won the bid, so they should play first
      await player0.waitForMessage("gameplay.play.player_turn", {
        player: player0.id,
      });
      await player1.waitForMessage("gameplay.play.player_turn", {
        player: player0.id,
      });
      await player2.waitForMessage("gameplay.play.player_turn", {
        player: player0.id,
      });
      await player3.waitForMessage("gameplay.play.player_turn", {
        player: player0.id,
      });

      player0.send(
        JSON.stringify({
          event: "gameplay.play.player_play_card",
          data: { card: "AC", player: player0.id },
        })
      );

      await player1.waitForMessage("gameplay.play.player_play_card", {
        player: player0.id,
        card: "AC",
      });
      await player2.waitForMessage("gameplay.play.player_play_card", {
        player: player0.id,
        card: "AC",
      });
      await player3.waitForMessage("gameplay.play.player_play_card", {
        player: player0.id,
        card: "AC",
      });

      await player0.waitForMessage("gameplay.play.player_turn", {
        player: player1.id,
      });
      await player1.waitForMessage("gameplay.play.player_turn", {
        player: player1.id,
      });
      await player2.waitForMessage("gameplay.play.player_turn", {
        player: player1.id,
      });
      await player3.waitForMessage("gameplay.play.player_turn", {
        player: player1.id,
      });

      player1.send(
        JSON.stringify({
          event: "gameplay.play.player_play_card",
          data: { card: "QC", player: player1.id },
        })
      );

      await player0.waitForMessage("gameplay.play.player_play_card", {
        player: player1.id,
        card: "QC",
      });
      await player2.waitForMessage("gameplay.play.player_play_card", {
        player: player1.id,
        card: "QC",
      });
      await player3.waitForMessage("gameplay.play.player_play_card", {
        player: player1.id,
        card: "QC",
      });

      await player0.waitForMessage("gameplay.play.player_turn", {
        player: player2.id,
      });
      await player1.waitForMessage("gameplay.play.player_turn", {
        player: player2.id,
      });
      await player2.waitForMessage("gameplay.play.player_turn", {
        player: player2.id,
      });
      await player3.waitForMessage("gameplay.play.player_turn", {
        player: player2.id,
      });

      player2.send(
        JSON.stringify({
          event: "gameplay.play.player_play_card",
          data: { card: "QC", player: player2.id },
        })
      );

      await player0.waitForMessage("gameplay.play.player_play_card", {
        player: player2.id,
        card: "QC",
      });
      await player1.waitForMessage("gameplay.play.player_play_card", {
        player: player2.id,
        card: "QC",
      });
      await player3.waitForMessage("gameplay.play.player_play_card", {
        player: player2.id,
        card: "QC",
      });

      await player0.waitForMessage("gameplay.play.player_turn", {
        player: player3.id,
      });
      await player1.waitForMessage("gameplay.play.player_turn", {
        player: player3.id,
      });
      await player2.waitForMessage("gameplay.play.player_turn", {
        player: player3.id,
      });
      await player3.waitForMessage("gameplay.play.player_turn", {
        player: player3.id,
      });

      player3.send(
        JSON.stringify({
          event: "gameplay.play.player_play_card",
          data: { card: "9C", player: player3.id },
        })
      );

      await player0.waitForMessage("gameplay.play.player_play_card", {
        player: player3.id,
        card: "9C",
      });
      await player1.waitForMessage("gameplay.play.player_play_card", {
        player: player3.id,
        card: "9C",
      });
      await player2.waitForMessage("gameplay.play.player_play_card", {
        player: player3.id,
        card: "9C",
      });

      await player0.waitForMessage("gameplay.play.trick_end", {
        player: player0.id,
        points: [
          [90, 20],
          [30, 0],
        ],
        is_last_trick: false,
      });
      await player1.waitForMessage("gameplay.play.trick_end", {
        player: player0.id,
        points: [
          [90, 20],
          [30, 0],
        ],
        is_last_trick: false,
      });
      await player2.waitForMessage("gameplay.play.trick_end", {
        player: player0.id,
        points: [
          [90, 20],
          [30, 0],
        ],
        is_last_trick: false,
      });
      await player3.waitForMessage("gameplay.play.trick_end", {
        player: player0.id,
        points: [
          [90, 20],
          [30, 0],
        ],
        is_last_trick: false,
      });

      // round 2

      // player 0 won the trick, so he starts the next one
      await player0.waitForMessage("gameplay.play.player_turn", {
        player: player0.id,
      });
      await player1.waitForMessage("gameplay.play.player_turn", {
        player: player0.id,
      });
      await player2.waitForMessage("gameplay.play.player_turn", {
        player: player0.id,
      });
      await player3.waitForMessage("gameplay.play.player_turn", {
        player: player0.id,
      });

      player0.send(
        JSON.stringify({
          event: "gameplay.play.player_play_card",
          data: { card: "QH", player: player0.id },
        })
      );

      await player1.waitForMessage("gameplay.play.player_play_card", {
        player: player0.id,
        card: "QH",
      });
      await player2.waitForMessage("gameplay.play.player_play_card", {
        player: player0.id,
        card: "QH",
      });
      await player3.waitForMessage("gameplay.play.player_play_card", {
        player: player0.id,
        card: "QH",
      });

      await player0.waitForMessage("gameplay.play.player_turn", {
        player: player1.id,
      });
      await player1.waitForMessage("gameplay.play.player_turn", {
        player: player1.id,
      });
      await player2.waitForMessage("gameplay.play.player_turn", {
        player: player1.id,
      });
      await player3.waitForMessage("gameplay.play.player_turn", {
        player: player1.id,
      });

      player1.send(
        JSON.stringify({
          event: "gameplay.play.player_play_card",
          data: { card: "AH", player: player1.id },
        })
      );

      await player0.waitForMessage("gameplay.play.player_play_card", {
        player: player1.id,
        card: "AH",
      });
      await player2.waitForMessage("gameplay.play.player_play_card", {
        player: player1.id,
        card: "AH",
      });
      await player3.waitForMessage("gameplay.play.player_play_card", {
        player: player1.id,
        card: "AH",
      });

      await player0.waitForMessage("gameplay.play.player_turn", {
        player: player2.id,
      });
      await player1.waitForMessage("gameplay.play.player_turn", {
        player: player2.id,
      });
      await player2.waitForMessage("gameplay.play.player_turn", {
        player: player2.id,
      });
      await player3.waitForMessage("gameplay.play.player_turn", {
        player: player2.id,
      });

      player2.send(
        JSON.stringify({
          event: "gameplay.play.player_play_card",
          data: { card: "QH", player: player2.id },
        })
      );

      await player0.waitForMessage("gameplay.play.player_play_card", {
        player: player2.id,
        card: "QH",
      });
      await player1.waitForMessage("gameplay.play.player_play_card", {
        player: player2.id,
        card: "QH",
      });
      await player3.waitForMessage("gameplay.play.player_play_card", {
        player: player2.id,
        card: "QH",
      });

      await player0.waitForMessage("gameplay.play.player_turn", {
        player: player3.id,
      });
      await player1.waitForMessage("gameplay.play.player_turn", {
        player: player3.id,
      });
      await player2.waitForMessage("gameplay.play.player_turn", {
        player: player3.id,
      });
      await player3.waitForMessage("gameplay.play.player_turn", {
        player: player3.id,
      });

      player3.send(
        JSON.stringify({
          event: "gameplay.play.player_play_card",
          data: { card: "10H", player: player3.id },
        })
      );

      await player0.waitForMessage("gameplay.play.player_play_card", {
        player: player3.id,
        card: "10H",
      });
      await player1.waitForMessage("gameplay.play.player_play_card", {
        player: player3.id,
        card: "10H",
      });
      await player2.waitForMessage("gameplay.play.player_play_card", {
        player: player3.id,
        card: "10H",
      });

      await player0.waitForMessage("gameplay.play.trick_end", {
        player: player1.id,
        points: [
          [90, 20],
          [30, 30],
        ],
        is_last_trick: false,
      });
      await player1.waitForMessage("gameplay.play.trick_end", {
        player: player1.id,
        points: [
          [90, 20],
          [30, 30],
        ],
        is_last_trick: false,
      });
      await player2.waitForMessage("gameplay.play.trick_end", {
        player: player1.id,
        points: [
          [90, 20],
          [30, 30],
        ],
        is_last_trick: false,
      });
      await player3.waitForMessage("gameplay.play.trick_end", {
        player: player1.id,
        points: [
          [90, 20],
          [30, 30],
        ],
        is_last_trick: false,
      });

      // round 3
      // player 1 won the trick, so he starts the next one
      await player0.waitForMessage("gameplay.play.player_turn", {
        player: player1.id,
      });
      await player1.waitForMessage("gameplay.play.player_turn", {
        player: player1.id,
      });
      await player2.waitForMessage("gameplay.play.player_turn", {
        player: player1.id,
      });
      await player3.waitForMessage("gameplay.play.player_turn", {
        player: player1.id,
      });

      player1.send(
        JSON.stringify({
          event: "gameplay.play.player_play_card",
          data: { card: "AS", player: player1.id },
        })
      );

      await player0.waitForMessage("gameplay.play.player_play_card", {
        player: player1.id,
        card: "AS",
      });
      await player2.waitForMessage("gameplay.play.player_play_card", {
        player: player1.id,
        card: "AS",
      });
      await player3.waitForMessage("gameplay.play.player_play_card", {
        player: player1.id,
        card: "AS",
      });

      await player0.waitForMessage("gameplay.play.player_turn", {
        player: player2.id,
      });
      await player1.waitForMessage("gameplay.play.player_turn", {
        player: player2.id,
      });
      await player2.waitForMessage("gameplay.play.player_turn", {
        player: player2.id,
      });
      await player3.waitForMessage("gameplay.play.player_turn", {
        player: player2.id,
      });

      player2.send(
        JSON.stringify({
          event: "gameplay.play.player_play_card",
          data: { card: "9S", player: player2.id },
        })
      );

      await player0.waitForMessage("gameplay.play.player_play_card", {
        player: player2.id,
        card: "9S",
      });
      await player1.waitForMessage("gameplay.play.player_play_card", {
        player: player2.id,
        card: "9S",
      });
      await player3.waitForMessage("gameplay.play.player_play_card", {
        player: player2.id,
        card: "9S",
      });

      await player0.waitForMessage("gameplay.play.player_turn", {
        player: player3.id,
      });
      await player1.waitForMessage("gameplay.play.player_turn", {
        player: player3.id,
      });
      await player2.waitForMessage("gameplay.play.player_turn", {
        player: player3.id,
      });
      await player3.waitForMessage("gameplay.play.player_turn", {
        player: player3.id,
      });

      player3.send(
        JSON.stringify({
          event: "gameplay.play.player_play_card",
          data: { card: "KS", player: player3.id },
        })
      );

      await player0.waitForMessage("gameplay.play.player_play_card", {
        player: player3.id,
        card: "KS",
      });
      await player1.waitForMessage("gameplay.play.player_play_card", {
        player: player3.id,
        card: "KS",
      });
      await player2.waitForMessage("gameplay.play.player_play_card", {
        player: player3.id,
        card: "KS",
      });

      await player0.waitForMessage("gameplay.play.player_turn", {
        player: player0.id,
      });
      await player1.waitForMessage("gameplay.play.player_turn", {
        player: player0.id,
      });
      await player2.waitForMessage("gameplay.play.player_turn", {
        player: player0.id,
      });
      await player3.waitForMessage("gameplay.play.player_turn", {
        player: player0.id,
      });

      player0.send(
        JSON.stringify({
          event: "gameplay.play.player_play_card",
          data: { card: "QS", player: player0.id },
        })
      );

      await player1.waitForMessage("gameplay.play.player_play_card", {
        player: player0.id,
        card: "QS",
      });
      await player2.waitForMessage("gameplay.play.player_play_card", {
        player: player0.id,
        card: "QS",
      });
      await player3.waitForMessage("gameplay.play.player_play_card", {
        player: player0.id,
        card: "QS",
      });

      await player0.waitForMessage("gameplay.play.trick_end", {
        player: player1.id,
        points: [
          [90, 20],
          [30, 50],
        ],
        is_last_trick: false,
      });
      await player1.waitForMessage("gameplay.play.trick_end", {
        player: player1.id,
        points: [
          [90, 20],
          [30, 50],
        ],
        is_last_trick: false,
      });
      await player2.waitForMessage("gameplay.play.trick_end", {
        player: player1.id,
        points: [
          [90, 20],
          [30, 50],
        ],
        is_last_trick: false,
      });
      await player3.waitForMessage("gameplay.play.trick_end", {
        player: player1.id,
        points: [
          [90, 20],
          [30, 50],
        ],
        is_last_trick: false,
      });

      // round 4
      // player 1 won the trick, so he starts the next one
      await player0.waitForMessage("gameplay.play.player_turn", {
        player: player1.id,
      });
      await player1.waitForMessage("gameplay.play.player_turn", {
        player: player1.id,
      });
      await player2.waitForMessage("gameplay.play.player_turn", {
        player: player1.id,
      });
      await player3.waitForMessage("gameplay.play.player_turn", {
        player: player1.id,
      });

      player1.send(
        JSON.stringify({
          event: "gameplay.play.player_play_card",
          data: { card: "QD", player: player1.id },
        })
      );

      await player0.waitForMessage("gameplay.play.player_play_card", {
        player: player1.id,
        card: "QD",
      });
      await player2.waitForMessage("gameplay.play.player_play_card", {
        player: player1.id,
        card: "QD",
      });
      await player3.waitForMessage("gameplay.play.player_play_card", {
        player: player1.id,
        card: "QD",
      });

      await player0.waitForMessage("gameplay.play.player_turn", {
        player: player2.id,
      });
      await player1.waitForMessage("gameplay.play.player_turn", {
        player: player2.id,
      });
      await player2.waitForMessage("gameplay.play.player_turn", {
        player: player2.id,
      });
      await player3.waitForMessage("gameplay.play.player_turn", {
        player: player2.id,
      });

      player2.send(
        JSON.stringify({
          event: "gameplay.play.player_play_card",
          data: { card: "9D", player: player2.id },
        })
      );

      await player0.waitForMessage("gameplay.play.player_play_card", {
        player: player2.id,
        card: "9D",
      });
      await player1.waitForMessage("gameplay.play.player_play_card", {
        player: player2.id,
        card: "9D",
      });
      await player3.waitForMessage("gameplay.play.player_play_card", {
        player: player2.id,
        card: "9D",
      });

      await player0.waitForMessage("gameplay.play.player_turn", {
        player: player3.id,
      });
      await player1.waitForMessage("gameplay.play.player_turn", {
        player: player3.id,
      });
      await player2.waitForMessage("gameplay.play.player_turn", {
        player: player3.id,
      });
      await player3.waitForMessage("gameplay.play.player_turn", {
        player: player3.id,
      });

      player3.send(
        JSON.stringify({
          event: "gameplay.play.player_play_card",
          data: { card: "AD", player: player3.id },
        })
      );

      await player0.waitForMessage("gameplay.play.player_play_card", {
        player: player3.id,
        card: "AD",
      });
      await player1.waitForMessage("gameplay.play.player_play_card", {
        player: player3.id,
        card: "AD",
      });
      await player2.waitForMessage("gameplay.play.player_play_card", {
        player: player3.id,
        card: "AD",
      });

      await player0.waitForMessage("gameplay.play.player_turn", {
        player: player0.id,
      });
      await player1.waitForMessage("gameplay.play.player_turn", {
        player: player0.id,
      });
      await player2.waitForMessage("gameplay.play.player_turn", {
        player: player0.id,
      });
      await player3.waitForMessage("gameplay.play.player_turn", {
        player: player0.id,
      });

      player0.send(
        JSON.stringify({
          event: "gameplay.play.player_play_card",
          data: { card: "JD", player: player0.id },
        })
      );

      await player1.waitForMessage("gameplay.play.player_play_card", {
        player: player0.id,
        card: "JD",
      });
      await player2.waitForMessage("gameplay.play.player_play_card", {
        player: player0.id,
        card: "JD",
      });
      await player3.waitForMessage("gameplay.play.player_play_card", {
        player: player0.id,
        card: "JD",
      });

      await player0.waitForMessage("gameplay.play.trick_end", {
        player: player3.id,
        points: [
          [90, 20],
          [30, 65],
        ],
        is_last_trick: false,
      });
      await player1.waitForMessage("gameplay.play.trick_end", {
        player: player3.id,
        points: [
          [90, 20],
          [30, 65],
        ],
        is_last_trick: false,
      });
      await player2.waitForMessage("gameplay.play.trick_end", {
        player: player3.id,
        points: [
          [90, 20],
          [30, 65],
        ],
        is_last_trick: false,
      });
      await player3.waitForMessage("gameplay.play.trick_end", {
        player: player3.id,
        points: [
          [90, 20],
          [30, 65],
        ],
        is_last_trick: false,
      });

      // round 5
      // player 3 won the trick, so he starts the next one
      await player0.waitForMessage("gameplay.play.player_turn", {
        player: player3.id,
      });
      await player1.waitForMessage("gameplay.play.player_turn", {
        player: player3.id,
      });
      await player2.waitForMessage("gameplay.play.player_turn", {
        player: player3.id,
      });
      await player3.waitForMessage("gameplay.play.player_turn", {
        player: player3.id,
      });

      player3.send(
        JSON.stringify({
          event: "gameplay.play.player_play_card",
          data: { card: "AD", player: player3.id },
        })
      );

      await player0.waitForMessage("gameplay.play.player_play_card", {
        player: player3.id,
        card: "AD",
      });
      await player1.waitForMessage("gameplay.play.player_play_card", {
        player: player3.id,
        card: "AD",
      });
      await player2.waitForMessage("gameplay.play.player_play_card", {
        player: player3.id,
        card: "AD",
      });

      await player0.waitForMessage("gameplay.play.player_turn", {
        player: player0.id,
      });
      await player1.waitForMessage("gameplay.play.player_turn", {
        player: player0.id,
      });
      await player2.waitForMessage("gameplay.play.player_turn", {
        player: player0.id,
      });
      await player3.waitForMessage("gameplay.play.player_turn", {
        player: player0.id,
      });

      player0.send(
        JSON.stringify({
          event: "gameplay.play.player_play_card",
          data: { card: "KD", player: player0.id },
        })
      );

      await player1.waitForMessage("gameplay.play.player_play_card", {
        player: player0.id,
        card: "KD",
      });
      await player2.waitForMessage("gameplay.play.player_play_card", {
        player: player0.id,
        card: "KD",
      });
      await player3.waitForMessage("gameplay.play.player_play_card", {
        player: player0.id,
        card: "KD",
      });

      await player0.waitForMessage("gameplay.play.player_turn", {
        player: player1.id,
      });
      await player1.waitForMessage("gameplay.play.player_turn", {
        player: player1.id,
      });
      await player2.waitForMessage("gameplay.play.player_turn", {
        player: player1.id,
      });
      await player3.waitForMessage("gameplay.play.player_turn", {
        player: player1.id,
      });

      player1.send(
        JSON.stringify({
          event: "gameplay.play.player_play_card",
          data: { card: "10D", player: player1.id },
        })
      );

      await player0.waitForMessage("gameplay.play.player_play_card", {
        player: player1.id,
        card: "10D",
      });
      await player2.waitForMessage("gameplay.play.player_play_card", {
        player: player1.id,
        card: "10D",
      });
      await player3.waitForMessage("gameplay.play.player_play_card", {
        player: player1.id,
        card: "10D",
      });

      await player0.waitForMessage("gameplay.play.player_turn", {
        player: player2.id,
      });
      await player1.waitForMessage("gameplay.play.player_turn", {
        player: player2.id,
      });
      await player2.waitForMessage("gameplay.play.player_turn", {
        player: player2.id,
      });
      await player3.waitForMessage("gameplay.play.player_turn", {
        player: player2.id,
      });

      player2.send(
        JSON.stringify({
          event: "gameplay.play.player_play_card",
          data: { card: "JD", player: player2.id },
        })
      );

      await player0.waitForMessage("gameplay.play.player_play_card", {
        player: player2.id,
        card: "JD",
      });
      await player1.waitForMessage("gameplay.play.player_play_card", {
        player: player2.id,
        card: "JD",
      });
      await player3.waitForMessage("gameplay.play.player_play_card", {
        player: player2.id,
        card: "JD",
      });

      await player0.waitForMessage("gameplay.play.trick_end", {
        player: player3.id,
        points: [
          [90, 20],
          [30, 90],
        ],
        is_last_trick: false,
      });
      await player1.waitForMessage("gameplay.play.trick_end", {
        player: player3.id,
        points: [
          [90, 20],
          [30, 90],
        ],
        is_last_trick: false,
      });
      await player2.waitForMessage("gameplay.play.trick_end", {
        player: player3.id,
        points: [
          [90, 20],
          [30, 90],
        ],
        is_last_trick: false,
      });
      await player3.waitForMessage("gameplay.play.trick_end", {
        player: player3.id,
        points: [
          [90, 20],
          [30, 90],
        ],
        is_last_trick: false,
      });

      // round 6
      // player3 won the trick, so he starts the next one
      await player0.waitForMessage("gameplay.play.player_turn", {
        player: player3.id,
      });
      await player1.waitForMessage("gameplay.play.player_turn", {
        player: player3.id,
      });
      await player2.waitForMessage("gameplay.play.player_turn", {
        player: player3.id,
      });
      await player3.waitForMessage("gameplay.play.player_turn", {
        player: player3.id,
      });

      player3.send(
        JSON.stringify({
          event: "gameplay.play.player_play_card",
          data: { card: "KH", player: player3.id },
        })
      );

      await player0.waitForMessage("gameplay.play.player_play_card", {
        player: player3.id,
        card: "KH",
      });
      await player1.waitForMessage("gameplay.play.player_play_card", {
        player: player3.id,
        card: "KH",
      });
      await player2.waitForMessage("gameplay.play.player_play_card", {
        player: player3.id,
        card: "KH",
      });

      await player0.waitForMessage("gameplay.play.player_turn", {
        player: player0.id,
      });
      await player1.waitForMessage("gameplay.play.player_turn", {
        player: player0.id,
      });
      await player2.waitForMessage("gameplay.play.player_turn", {
        player: player0.id,
      });
      await player3.waitForMessage("gameplay.play.player_turn", {
        player: player0.id,
      });

      player0.send(
        JSON.stringify({
          event: "gameplay.play.player_play_card",
          data: { card: "JH", player: player0.id },
        })
      );

      await player1.waitForMessage("gameplay.play.player_play_card", {
        player: player0.id,
        card: "JH",
      });
      await player2.waitForMessage("gameplay.play.player_play_card", {
        player: player0.id,
        card: "JH",
      });
      await player3.waitForMessage("gameplay.play.player_play_card", {
        player: player0.id,
        card: "JH",
      });

      await player0.waitForMessage("gameplay.play.player_turn", {
        player: player1.id,
      });
      await player1.waitForMessage("gameplay.play.player_turn", {
        player: player1.id,
      });
      await player2.waitForMessage("gameplay.play.player_turn", {
        player: player1.id,
      });
      await player3.waitForMessage("gameplay.play.player_turn", {
        player: player1.id,
      });

      player1.send(
        JSON.stringify({
          event: "gameplay.play.player_play_card",
          data: { card: "9H", player: player1.id },
        })
      );

      await player0.waitForMessage("gameplay.play.player_play_card", {
        player: player1.id,
        card: "9H",
      });
      await player2.waitForMessage("gameplay.play.player_play_card", {
        player: player1.id,
        card: "9H",
      });
      await player3.waitForMessage("gameplay.play.player_play_card", {
        player: player1.id,
        card: "9H",
      });

      await player0.waitForMessage("gameplay.play.player_turn", {
        player: player2.id,
      });
      await player1.waitForMessage("gameplay.play.player_turn", {
        player: player2.id,
      });
      await player2.waitForMessage("gameplay.play.player_turn", {
        player: player2.id,
      });
      await player3.waitForMessage("gameplay.play.player_turn", {
        player: player2.id,
      });

      player2.send(
        JSON.stringify({
          event: "gameplay.play.player_play_card",
          data: { card: "10H", player: player2.id },
        })
      );

      await player0.waitForMessage("gameplay.play.player_play_card", {
        player: player2.id,
        card: "10H",
      });
      await player1.waitForMessage("gameplay.play.player_play_card", {
        player: player2.id,
        card: "10H",
      });
      await player3.waitForMessage("gameplay.play.player_play_card", {
        player: player2.id,
        card: "10H",
      });

      await player0.waitForMessage("gameplay.play.trick_end", {
        player: player2.id,
        points: [
          [90, 35],
          [30, 90],
        ],
        is_last_trick: false,
      });
      await player1.waitForMessage("gameplay.play.trick_end", {
        player: player2.id,
        points: [
          [90, 35],
          [30, 90],
        ],
        is_last_trick: false,
      });
      await player2.waitForMessage("gameplay.play.trick_end", {
        player: player2.id,
        points: [
          [90, 35],
          [30, 90],
        ],
        is_last_trick: false,
      });
      await player3.waitForMessage("gameplay.play.trick_end", {
        player: player2.id,
        points: [
          [90, 35],
          [30, 90],
        ],
        is_last_trick: false,
      });

      // round 7
      // player2 won the trick, so he starts the next one
      await player0.waitForMessage("gameplay.play.player_turn", {
        player: player2.id,
      });
      await player1.waitForMessage("gameplay.play.player_turn", {
        player: player2.id,
      });
      await player2.waitForMessage("gameplay.play.player_turn", {
        player: player2.id,
      });
      await player3.waitForMessage("gameplay.play.player_turn", {
        player: player2.id,
      });

      player2.send(
        JSON.stringify({
          event: "gameplay.play.player_play_card",
          data: { card: "QD", player: player2.id },
        })
      );

      await player0.waitForMessage("gameplay.play.player_play_card", {
        player: player2.id,
        card: "QD",
      });
      await player1.waitForMessage("gameplay.play.player_play_card", {
        player: player2.id,
        card: "QD",
      });
      await player3.waitForMessage("gameplay.play.player_play_card", {
        player: player2.id,
        card: "QD",
      });

      await player0.waitForMessage("gameplay.play.player_turn", {
        player: player3.id,
      });
      await player1.waitForMessage("gameplay.play.player_turn", {
        player: player3.id,
      });
      await player2.waitForMessage("gameplay.play.player_turn", {
        player: player3.id,
      });
      await player3.waitForMessage("gameplay.play.player_turn", {
        player: player3.id,
      });

      player3.send(
        JSON.stringify({
          event: "gameplay.play.player_play_card",
          data: { card: "KD", player: player3.id },
        })
      );

      await player0.waitForMessage("gameplay.play.player_play_card", {
        player: player3.id,
        card: "KD",
      });
      await player1.waitForMessage("gameplay.play.player_play_card", {
        player: player3.id,
        card: "KD",
      });
      await player2.waitForMessage("gameplay.play.player_play_card", {
        player: player3.id,
        card: "KD",
      });

      await player0.waitForMessage("gameplay.play.player_turn", {
        player: player0.id,
      });
      await player1.waitForMessage("gameplay.play.player_turn", {
        player: player0.id,
      });
      await player2.waitForMessage("gameplay.play.player_turn", {
        player: player0.id,
      });
      await player3.waitForMessage("gameplay.play.player_turn", {
        player: player0.id,
      });

      player0.send(
        JSON.stringify({
          event: "gameplay.play.player_play_card",
          data: { card: "10S", player: player0.id },
        })
      );

      await player1.waitForMessage("gameplay.play.player_play_card", {
        player: player0.id,
        card: "10S",
      });
      await player2.waitForMessage("gameplay.play.player_play_card", {
        player: player0.id,
        card: "10S",
      });
      await player3.waitForMessage("gameplay.play.player_play_card", {
        player: player0.id,
        card: "10S",
      });

      await player0.waitForMessage("gameplay.play.player_turn", {
        player: player1.id,
      });
      await player1.waitForMessage("gameplay.play.player_turn", {
        player: player1.id,
      });
      await player2.waitForMessage("gameplay.play.player_turn", {
        player: player1.id,
      });
      await player3.waitForMessage("gameplay.play.player_turn", {
        player: player1.id,
      });

      player1.send(
        JSON.stringify({
          event: "gameplay.play.player_play_card",
          data: { card: "9D", player: player1.id },
        })
      );

      await player0.waitForMessage("gameplay.play.player_play_card", {
        player: player1.id,
        card: "9D",
      });
      await player2.waitForMessage("gameplay.play.player_play_card", {
        player: player1.id,
        card: "9D",
      });
      await player3.waitForMessage("gameplay.play.player_play_card", {
        player: player1.id,
        card: "9D",
      });

      await player0.waitForMessage("gameplay.play.trick_end", {
        player: player0.id,
        points: [
          [90, 55],
          [30, 90],
        ],
        is_last_trick: false,
      });
      await player1.waitForMessage("gameplay.play.trick_end", {
        player: player0.id,
        points: [
          [90, 55],
          [30, 90],
        ],
        is_last_trick: false,
      });
      await player2.waitForMessage("gameplay.play.trick_end", {
        player: player0.id,
        points: [
          [90, 55],
          [30, 90],
        ],
        is_last_trick: false,
      });
      await player3.waitForMessage("gameplay.play.trick_end", {
        player: player0.id,
        points: [
          [90, 55],
          [30, 90],
        ],
        is_last_trick: false,
      });

      // round 8
      // player0 won the trick, so he starts the next one
      await player0.waitForMessage("gameplay.play.player_turn", {
        player: player0.id,
      });
      await player1.waitForMessage("gameplay.play.player_turn", {
        player: player0.id,
      });
      await player2.waitForMessage("gameplay.play.player_turn", {
        player: player0.id,
      });
      await player3.waitForMessage("gameplay.play.player_turn", {
        player: player0.id,
      });

      player0.send(
        JSON.stringify({
          event: "gameplay.play.player_play_card",
          data: { card: "JC", player: player0.id },
        })
      );

      await player1.waitForMessage("gameplay.play.player_play_card", {
        player: player0.id,
        card: "JC",
      });
      await player2.waitForMessage("gameplay.play.player_play_card", {
        player: player0.id,
        card: "JC",
      });
      await player3.waitForMessage("gameplay.play.player_play_card", {
        player: player0.id,
        card: "JC",
      });

      await player0.waitForMessage("gameplay.play.player_turn", {
        player: player1.id,
      });
      await player1.waitForMessage("gameplay.play.player_turn", {
        player: player1.id,
      });
      await player2.waitForMessage("gameplay.play.player_turn", {
        player: player1.id,
      });
      await player3.waitForMessage("gameplay.play.player_turn", {
        player: player1.id,
      });

      player1.send(
        JSON.stringify({
          event: "gameplay.play.player_play_card",
          data: { card: "KC", player: player1.id },
        })
      );

      await player0.waitForMessage("gameplay.play.player_play_card", {
        player: player1.id,
        card: "KC",
      });
      await player2.waitForMessage("gameplay.play.player_play_card", {
        player: player1.id,
        card: "KC",
      });
      await player3.waitForMessage("gameplay.play.player_play_card", {
        player: player1.id,
        card: "KC",
      });

      await player0.waitForMessage("gameplay.play.player_turn", {
        player: player2.id,
      });
      await player1.waitForMessage("gameplay.play.player_turn", {
        player: player2.id,
      });
      await player2.waitForMessage("gameplay.play.player_turn", {
        player: player2.id,
      });
      await player3.waitForMessage("gameplay.play.player_turn", {
        player: player2.id,
      });

      player2.send(
        JSON.stringify({
          event: "gameplay.play.player_play_card",
          data: { card: "AC", player: player2.id },
        })
      );

      await player0.waitForMessage("gameplay.play.player_play_card", {
        player: player2.id,
        card: "AC",
      });
      await player1.waitForMessage("gameplay.play.player_play_card", {
        player: player2.id,
        card: "AC",
      });
      await player3.waitForMessage("gameplay.play.player_play_card", {
        player: player2.id,
        card: "AC",
      });

      await player0.waitForMessage("gameplay.play.player_turn", {
        player: player3.id,
      });
      await player1.waitForMessage("gameplay.play.player_turn", {
        player: player3.id,
      });
      await player2.waitForMessage("gameplay.play.player_turn", {
        player: player3.id,
      });
      await player3.waitForMessage("gameplay.play.player_turn", {
        player: player3.id,
      });

      player3.send(
        JSON.stringify({
          event: "gameplay.play.player_play_card",
          data: { card: "9S", player: player3.id },
        })
      );

      await player0.waitForMessage("gameplay.play.player_play_card", {
        player: player3.id,
        card: "9S",
      });
      await player1.waitForMessage("gameplay.play.player_play_card", {
        player: player3.id,
        card: "9S",
      });
      await player2.waitForMessage("gameplay.play.player_play_card", {
        player: player3.id,
        card: "9S",
      });

      await player0.waitForMessage("gameplay.play.trick_end", {
        player: player3.id,
        points: [
          [90, 55],
          [30, 105],
        ],
        is_last_trick: false,
      });
      await player1.waitForMessage("gameplay.play.trick_end", {
        player: player3.id,
        points: [
          [90, 55],
          [30, 105],
        ],
        is_last_trick: false,
      });
      await player2.waitForMessage("gameplay.play.trick_end", {
        player: player3.id,
        points: [
          [90, 55],
          [30, 105],
        ],
        is_last_trick: false,
      });
      await player3.waitForMessage("gameplay.play.trick_end", {
        player: player3.id,
        points: [
          [90, 55],
          [30, 105],
        ],
        is_last_trick: false,
      });

      // // round 9
      // player3 won the trick, so he starts the next one
      await player0.waitForMessage("gameplay.play.player_turn", {
        player: player3.id,
      });
      await player1.waitForMessage("gameplay.play.player_turn", {
        player: player3.id,
      });
      await player2.waitForMessage("gameplay.play.player_turn", {
        player: player3.id,
      });
      await player3.waitForMessage("gameplay.play.player_turn", {
        player: player3.id,
      });

      player3.send(
        JSON.stringify({
          event: "gameplay.play.player_play_card",
          data: { card: "JH", player: player3.id },
        })
      );

      await player0.waitForMessage("gameplay.play.player_play_card", {
        player: player3.id,
        card: "JH",
      });
      await player1.waitForMessage("gameplay.play.player_play_card", {
        player: player3.id,
        card: "JH",
      });
      await player2.waitForMessage("gameplay.play.player_play_card", {
        player: player3.id,
        card: "JH",
      });

      await player0.waitForMessage("gameplay.play.player_turn", {
        player: player0.id,
      });
      await player1.waitForMessage("gameplay.play.player_turn", {
        player: player0.id,
      });
      await player2.waitForMessage("gameplay.play.player_turn", {
        player: player0.id,
      });
      await player3.waitForMessage("gameplay.play.player_turn", {
        player: player0.id,
      });

      player0.send(
        JSON.stringify({
          event: "gameplay.play.player_play_card",
          data: { card: "AS", player: player0.id },
        })
      );

      await player1.waitForMessage("gameplay.play.player_play_card", {
        player: player0.id,
        card: "AS",
      });
      await player2.waitForMessage("gameplay.play.player_play_card", {
        player: player0.id,
        card: "AS",
      });
      await player3.waitForMessage("gameplay.play.player_play_card", {
        player: player0.id,
        card: "AS",
      });

      await player0.waitForMessage("gameplay.play.player_turn", {
        player: player1.id,
      });
      await player1.waitForMessage("gameplay.play.player_turn", {
        player: player1.id,
      });
      await player2.waitForMessage("gameplay.play.player_turn", {
        player: player1.id,
      });
      await player3.waitForMessage("gameplay.play.player_turn", {
        player: player1.id,
      });

      player1.send(
        JSON.stringify({
          event: "gameplay.play.player_play_card",
          data: { card: "QS", player: player1.id },
        })
      );

      await player0.waitForMessage("gameplay.play.player_play_card", {
        player: player1.id,
        card: "QS",
      });
      await player2.waitForMessage("gameplay.play.player_play_card", {
        player: player1.id,
        card: "QS",
      });
      await player3.waitForMessage("gameplay.play.player_play_card", {
        player: player1.id,
        card: "QS",
      });

      await player0.waitForMessage("gameplay.play.player_turn", {
        player: player2.id,
      });
      await player1.waitForMessage("gameplay.play.player_turn", {
        player: player2.id,
      });
      await player2.waitForMessage("gameplay.play.player_turn", {
        player: player2.id,
      });
      await player3.waitForMessage("gameplay.play.player_turn", {
        player: player2.id,
      });

      player2.send(
        JSON.stringify({
          event: "gameplay.play.player_play_card",
          data: { card: "AH", player: player2.id },
        })
      );

      await player0.waitForMessage("gameplay.play.player_play_card", {
        player: player2.id,
        card: "AH",
      });
      await player1.waitForMessage("gameplay.play.player_play_card", {
        player: player2.id,
        card: "AH",
      });
      await player3.waitForMessage("gameplay.play.player_play_card", {
        player: player2.id,
        card: "AH",
      });

      await player0.waitForMessage("gameplay.play.trick_end", {
        player: player0.id,
        points: [
          [90, 80],
          [30, 105],
        ],
        is_last_trick: false,
      });
      await player1.waitForMessage("gameplay.play.trick_end", {
        player: player0.id,
        points: [
          [90, 80],
          [30, 105],
        ],
        is_last_trick: false,
      });
      await player2.waitForMessage("gameplay.play.trick_end", {
        player: player0.id,
        points: [
          [90, 80],
          [30, 105],
        ],
        is_last_trick: false,
      });
      await player3.waitForMessage("gameplay.play.trick_end", {
        player: player0.id,
        points: [
          [90, 80],
          [30, 105],
        ],
        is_last_trick: false,
      });

      // round 10
      // player0 won the trick, so he starts the next one
      await player0.waitForMessage("gameplay.play.player_turn", {
        player: player0.id,
      });
      await player1.waitForMessage("gameplay.play.player_turn", {
        player: player0.id,
      });
      await player2.waitForMessage("gameplay.play.player_turn", {
        player: player0.id,
      });
      await player3.waitForMessage("gameplay.play.player_turn", {
        player: player0.id,
      });

      player0.send(
        JSON.stringify({
          event: "gameplay.play.player_play_card",
          data: { card: "9C", player: player0.id },
        })
      );

      await player1.waitForMessage("gameplay.play.player_play_card", {
        player: player0.id,
        card: "9C",
      });
      await player2.waitForMessage("gameplay.play.player_play_card", {
        player: player0.id,
        card: "9C",
      });
      await player3.waitForMessage("gameplay.play.player_play_card", {
        player: player0.id,
        card: "9C",
      });

      await player0.waitForMessage("gameplay.play.player_turn", {
        player: player1.id,
      });
      await player1.waitForMessage("gameplay.play.player_turn", {
        player: player1.id,
      });
      await player2.waitForMessage("gameplay.play.player_turn", {
        player: player1.id,
      });
      await player3.waitForMessage("gameplay.play.player_turn", {
        player: player1.id,
      });

      player1.send(
        JSON.stringify({
          event: "gameplay.play.player_play_card",
          data: { card: "KC", player: player1.id },
        })
      );

      await player0.waitForMessage("gameplay.play.player_play_card", {
        player: player1.id,
        card: "KC",
      });
      await player2.waitForMessage("gameplay.play.player_play_card", {
        player: player1.id,
        card: "KC",
      });
      await player3.waitForMessage("gameplay.play.player_play_card", {
        player: player1.id,
        card: "KC",
      });

      await player0.waitForMessage("gameplay.play.player_turn", {
        player: player2.id,
      });
      await player1.waitForMessage("gameplay.play.player_turn", {
        player: player2.id,
      });
      await player2.waitForMessage("gameplay.play.player_turn", {
        player: player2.id,
      });
      await player3.waitForMessage("gameplay.play.player_turn", {
        player: player2.id,
      });

      player2.send(
        JSON.stringify({
          event: "gameplay.play.player_play_card",
          data: { card: "10D", player: player2.id },
        })
      );

      await player0.waitForMessage("gameplay.play.player_play_card", {
        player: player2.id,
        card: "10D",
      });
      await player1.waitForMessage("gameplay.play.player_play_card", {
        player: player2.id,
        card: "10D",
      });
      await player3.waitForMessage("gameplay.play.player_play_card", {
        player: player2.id,
        card: "10D",
      });

      await player0.waitForMessage("gameplay.play.player_turn", {
        player: player3.id,
      });
      await player1.waitForMessage("gameplay.play.player_turn", {
        player: player3.id,
      });
      await player2.waitForMessage("gameplay.play.player_turn", {
        player: player3.id,
      });
      await player3.waitForMessage("gameplay.play.player_turn", {
        player: player3.id,
      });

      player3.send(
        JSON.stringify({
          event: "gameplay.play.player_play_card",
          data: { card: "JS", player: player3.id },
        })
      );

      await player0.waitForMessage("gameplay.play.player_play_card", {
        player: player3.id,
        card: "JS",
      });
      await player1.waitForMessage("gameplay.play.player_play_card", {
        player: player3.id,
        card: "JS",
      });
      await player2.waitForMessage("gameplay.play.player_play_card", {
        player: player3.id,
        card: "JS",
      });

      await player0.waitForMessage("gameplay.play.trick_end", {
        player: player3.id,
        points: [
          [90, 80],
          [30, 120],
        ],
        is_last_trick: false,
      });
      await player1.waitForMessage("gameplay.play.trick_end", {
        player: player3.id,
        points: [
          [90, 80],
          [30, 120],
        ],
        is_last_trick: false,
      });
      await player2.waitForMessage("gameplay.play.trick_end", {
        player: player3.id,
        points: [
          [90, 80],
          [30, 120],
        ],
        is_last_trick: false,
      });
      await player3.waitForMessage("gameplay.play.trick_end", {
        player: player3.id,
        points: [
          [90, 80],
          [30, 120],
        ],
        is_last_trick: false,
      });

      // round 11
      // player3 won the trick, so he starts the next one
      await player0.waitForMessage("gameplay.play.player_turn", {
        player: player3.id,
      });
      await player1.waitForMessage("gameplay.play.player_turn", {
        player: player3.id,
      });
      await player2.waitForMessage("gameplay.play.player_turn", {
        player: player3.id,
      });
      await player3.waitForMessage("gameplay.play.player_turn", {
        player: player3.id,
      });

      player3.send(
        JSON.stringify({
          event: "gameplay.play.player_play_card",
          data: { card: "9H", player: player3.id },
        })
      );

      await player0.waitForMessage("gameplay.play.player_play_card", {
        player: player3.id,
        card: "9H",
      });
      await player1.waitForMessage("gameplay.play.player_play_card", {
        player: player3.id,
        card: "9H",
      });
      await player2.waitForMessage("gameplay.play.player_play_card", {
        player: player3.id,
        card: "9H",
      });

      await player0.waitForMessage("gameplay.play.player_turn", {
        player: player0.id,
      });
      await player1.waitForMessage("gameplay.play.player_turn", {
        player: player0.id,
      });
      await player2.waitForMessage("gameplay.play.player_turn", {
        player: player0.id,
      });
      await player3.waitForMessage("gameplay.play.player_turn", {
        player: player0.id,
      });

      player0.send(
        JSON.stringify({
          event: "gameplay.play.player_play_card",
          data: { card: "KS", player: player0.id },
        })
      );

      await player1.waitForMessage("gameplay.play.player_play_card", {
        player: player0.id,
        card: "KS",
      });
      await player2.waitForMessage("gameplay.play.player_play_card", {
        player: player0.id,
        card: "KS",
      });
      await player3.waitForMessage("gameplay.play.player_play_card", {
        player: player0.id,
        card: "KS",
      });

      await player0.waitForMessage("gameplay.play.player_turn", {
        player: player1.id,
      });
      await player1.waitForMessage("gameplay.play.player_turn", {
        player: player1.id,
      });
      await player2.waitForMessage("gameplay.play.player_turn", {
        player: player1.id,
      });
      await player3.waitForMessage("gameplay.play.player_turn", {
        player: player1.id,
      });

      player1.send(
        JSON.stringify({
          event: "gameplay.play.player_play_card",
          data: { card: "10S", player: player1.id },
        })
      );

      await player0.waitForMessage("gameplay.play.player_play_card", {
        player: player1.id,
        card: "10S",
      });
      await player2.waitForMessage("gameplay.play.player_play_card", {
        player: player1.id,
        card: "10S",
      });
      await player3.waitForMessage("gameplay.play.player_play_card", {
        player: player1.id,
        card: "10S",
      });

      await player0.waitForMessage("gameplay.play.player_turn", {
        player: player2.id,
      });
      await player1.waitForMessage("gameplay.play.player_turn", {
        player: player2.id,
      });
      await player2.waitForMessage("gameplay.play.player_turn", {
        player: player2.id,
      });
      await player3.waitForMessage("gameplay.play.player_turn", {
        player: player2.id,
      });

      player2.send(
        JSON.stringify({
          event: "gameplay.play.player_play_card",
          data: { card: "KH", player: player2.id },
        })
      );

      await player0.waitForMessage("gameplay.play.player_play_card", {
        player: player2.id,
        card: "KH",
      });
      await player1.waitForMessage("gameplay.play.player_play_card", {
        player: player2.id,
        card: "KH",
      });
      await player3.waitForMessage("gameplay.play.player_play_card", {
        player: player2.id,
        card: "KH",
      });

      await player0.waitForMessage("gameplay.play.trick_end", {
        player: player1.id,
        points: [
          [90, 80],
          [30, 140],
        ],
        is_last_trick: false,
      });
      await player1.waitForMessage("gameplay.play.trick_end", {
        player: player1.id,
        points: [
          [90, 80],
          [30, 140],
        ],
        is_last_trick: false,
      });
      await player2.waitForMessage("gameplay.play.trick_end", {
        player: player1.id,
        points: [
          [90, 80],
          [30, 140],
        ],
        is_last_trick: false,
      });
      await player3.waitForMessage("gameplay.play.trick_end", {
        player: player1.id,
        points: [
          [90, 80],
          [30, 140],
        ],
        is_last_trick: false,
      });

      // // round 12
      // // player1 won the trick, so he starts the next one
      await player0.waitForMessage("gameplay.play.player_turn", {
        player: player1.id,
      });
      await player1.waitForMessage("gameplay.play.player_turn", {
        player: player1.id,
      });
      await player2.waitForMessage("gameplay.play.player_turn", {
        player: player1.id,
      });
      await player3.waitForMessage("gameplay.play.player_turn", {
        player: player1.id,
      });

      player1.send(
        JSON.stringify({
          event: "gameplay.play.player_play_card",
          data: { card: "10C", player: player1.id },
        })
      );

      await player0.waitForMessage("gameplay.play.player_play_card", {
        player: player1.id,
        card: "10C",
      });
      await player2.waitForMessage("gameplay.play.player_play_card", {
        player: player1.id,
        card: "10C",
      });
      await player3.waitForMessage("gameplay.play.player_play_card", {
        player: player1.id,
        card: "10C",
      });

      await player0.waitForMessage("gameplay.play.player_turn", {
        player: player2.id,
      });
      await player1.waitForMessage("gameplay.play.player_turn", {
        player: player2.id,
      });
      await player2.waitForMessage("gameplay.play.player_turn", {
        player: player2.id,
      });
      await player3.waitForMessage("gameplay.play.player_turn", {
        player: player2.id,
      });

      player2.send(
        JSON.stringify({
          event: "gameplay.play.player_play_card",
          data: { card: "JC", player: player2.id },
        })
      );

      await player0.waitForMessage("gameplay.play.player_play_card", {
        player: player2.id,
        card: "JC",
      });
      await player1.waitForMessage("gameplay.play.player_play_card", {
        player: player2.id,
        card: "JC",
      });
      await player3.waitForMessage("gameplay.play.player_play_card", {
        player: player2.id,
        card: "JC",
      });

      await player0.waitForMessage("gameplay.play.player_turn", {
        player: player3.id,
      });
      await player1.waitForMessage("gameplay.play.player_turn", {
        player: player3.id,
      });
      await player2.waitForMessage("gameplay.play.player_turn", {
        player: player3.id,
      });
      await player3.waitForMessage("gameplay.play.player_turn", {
        player: player3.id,
      });

      player3.send(
        JSON.stringify({
          event: "gameplay.play.player_play_card",
          data: { card: "JS", player: player3.id },
        })
      );

      await player0.waitForMessage("gameplay.play.player_play_card", {
        player: player3.id,
        card: "JS",
      });
      await player1.waitForMessage("gameplay.play.player_play_card", {
        player: player3.id,
        card: "JS",
      });
      await player2.waitForMessage("gameplay.play.player_play_card", {
        player: player3.id,
        card: "JS",
      });

      await player0.waitForMessage("gameplay.play.player_turn", {
        player: player0.id,
      });
      await player1.waitForMessage("gameplay.play.player_turn", {
        player: player0.id,
      });
      await player2.waitForMessage("gameplay.play.player_turn", {
        player: player0.id,
      });
      await player3.waitForMessage("gameplay.play.player_turn", {
        player: player0.id,
      });

      player0.send(
        JSON.stringify({
          event: "gameplay.play.player_play_card",
          data: { card: "10C", player: player0.id },
        })
      );

      await player1.waitForMessage("gameplay.play.player_play_card", {
        player: player0.id,
        card: "10C",
      });
      await player2.waitForMessage("gameplay.play.player_play_card", {
        player: player0.id,
        card: "10C",
      });
      await player3.waitForMessage("gameplay.play.player_play_card", {
        player: player0.id,
        card: "10C",
      });

      await player0.waitForMessage("gameplay.play.trick_end", {
        player: player3.id,
        points: [
          [90, 80],
          [30, 170],
        ],
        is_last_trick: true,
      });
      await player1.waitForMessage("gameplay.play.trick_end", {
        player: player3.id,
        points: [
          [90, 80],
          [30, 170],
        ],
        is_last_trick: true,
      });
      await player2.waitForMessage("gameplay.play.trick_end", {
        player: player3.id,
        points: [
          [90, 80],
          [30, 170],
        ],
        is_last_trick: true,
      });
      await player3.waitForMessage("gameplay.play.trick_end", {
        player: player3.id,
        points: [
          [90, 80],
          [30, 170],
        ],
        is_last_trick: true,
      });

      // and the round is over!
      await player0.waitForMessage("gameplay.post_play.round_end", {
        score: [170, 200],
        has_made_bid: true,
        game_over: false,
      });
      await player1.waitForMessage("gameplay.post_play.round_end", {
        score: [170, 200],
        has_made_bid: true,
        game_over: false,
      });
      await player2.waitForMessage("gameplay.post_play.round_end", {
        score: [170, 200],
        has_made_bid: true,
        game_over: false,
      });
      await player3.waitForMessage("gameplay.post_play.round_end", {
        score: [170, 200],
        has_made_bid: true,
        game_over: false,
      });

      // new round begins
      await player0.waitForMessage("gameplay.pre_play.round_start", {
        player: player1.id,
      });
      await player1.waitForMessage("gameplay.pre_play.round_start", {
        player: player1.id,
      });
      await player2.waitForMessage("gameplay.pre_play.round_start", {
        player: player1.id,
      });
      await player3.waitForMessage("gameplay.pre_play.round_start", {
        player: player1.id,
      });
    },
    60 * 1000
  );
});
