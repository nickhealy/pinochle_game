import { mockRandom } from "jest-mock-random";
import { interpret } from "xstate";
import ConnectionSupervisorMachine from "../ConnectionSupervisor/machine";
import { getTestClient } from "../networking/__tests__/mockClient";

jest.mock("../gameplay/Deck");
jest.mock("../networking/webrtc");

describe("integration test", () => {
  beforeAll(() => {
    mockRandom([0.9, 0.7, 0.3, 0.1]);
  });

  it("gameplay", async () => {
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

    await player0.waitForMessage("gameplay.bid.awaiting_bid", { player: 1 });
    await player1.waitForMessage("gameplay.bid.awaiting_bid", { player: 1 });
    await player2.waitForMessage("gameplay.bid.awaiting_bid", { player: 1 });
    await player3.waitForMessage("gameplay.bid.awaiting_bid", { player: 1 });

    // player @ index 1 (scott's) turn to make a bid
    player1.send(
      JSON.stringify({ event: "gameplay.bid.player_bid", data: { value: 140 } })
    );

    await player0.waitForMessage("gameplay.bid.player_bid", {
      player: 1,
      bid: 140,
    });
    await player2.waitForMessage("gameplay.bid.player_bid", {
      player: 1,
      bid: 140,
    });
    await player3.waitForMessage("gameplay.bid.player_bid", {
      player: 1,
      bid: 140,
    });

    await player0.waitForMessage("gameplay.bid.awaiting_bid", { player: 2 });
    await player1.waitForMessage("gameplay.bid.awaiting_bid", { player: 2 });
    await player2.waitForMessage("gameplay.bid.awaiting_bid", { player: 2 });
    await player3.waitForMessage("gameplay.bid.awaiting_bid", { player: 2 });

    player2.send(
      JSON.stringify({ event: "gameplay.bid.player_bid", data: { value: 150 } })
    );

    await player0.waitForMessage("gameplay.bid.player_bid", {
      player: 2,
      bid: 150,
    });
    await player1.waitForMessage("gameplay.bid.player_bid", {
      player: 2,
      bid: 150,
    });
    await player3.waitForMessage("gameplay.bid.player_bid", {
      player: 2,
      bid: 150,
    });

    await player0.waitForMessage("gameplay.bid.awaiting_bid", { player: 3 });
    await player1.waitForMessage("gameplay.bid.awaiting_bid", { player: 3 });
    await player2.waitForMessage("gameplay.bid.awaiting_bid", { player: 3 });
    await player3.waitForMessage("gameplay.bid.awaiting_bid", { player: 3 });

    player3.send(
      JSON.stringify({
        event: "gameplay.bid.player_fold",
      })
    );

    await player0.waitForMessage("gameplay.bid.player_fold", {
      player: 3,
    });
    await player1.waitForMessage("gameplay.bid.player_fold", {
      player: 3,
    });
    await player2.waitForMessage("gameplay.bid.player_fold", {
      player: 3,
    });

    await player0.waitForMessage("gameplay.bid.awaiting_bid", { player: 0 });
    await player1.waitForMessage("gameplay.bid.awaiting_bid", { player: 0 });
    await player2.waitForMessage("gameplay.bid.awaiting_bid", { player: 0 });
    await player3.waitForMessage("gameplay.bid.awaiting_bid", { player: 0 });

    player0.send(
      JSON.stringify({ event: "gameplay.bid.player_bid", data: { value: 160 } })
    );

    await player1.waitForMessage("gameplay.bid.player_bid", {
      player: 0,
      bid: 160,
    });
    await player2.waitForMessage("gameplay.bid.player_bid", {
      player: 0,
      bid: 160,
    });
    await player3.waitForMessage("gameplay.bid.player_bid", {
      player: 0,
      bid: 160,
    });

    await player0.waitForMessage("gameplay.bid.awaiting_bid", { player: 1 });
    await player1.waitForMessage("gameplay.bid.awaiting_bid", { player: 1 });
    await player2.waitForMessage("gameplay.bid.awaiting_bid", { player: 1 });
    await player3.waitForMessage("gameplay.bid.awaiting_bid", { player: 1 });

    player1.send(
      JSON.stringify({
        event: "gameplay.bid.player_fold",
      })
    );

    await player0.waitForMessage("gameplay.bid.player_fold", {
      player: 1,
    });
    await player2.waitForMessage("gameplay.bid.player_fold", {
      player: 1,
    });
    await player3.waitForMessage("gameplay.bid.player_fold", {
      player: 1,
    });

    await player0.waitForMessage("gameplay.bid.awaiting_bid", { player: 2 });
    await player1.waitForMessage("gameplay.bid.awaiting_bid", { player: 2 });
    await player2.waitForMessage("gameplay.bid.awaiting_bid", { player: 2 });
    await player3.waitForMessage("gameplay.bid.awaiting_bid", { player: 2 });

    player2.send(
      JSON.stringify({
        event: "gameplay.bid.player_fold",
      })
    );

    await player0.waitForMessage("gameplay.bid.player_fold", {
      player: 2,
    });
    await player1.waitForMessage("gameplay.bid.player_fold", {
      player: 2,
    });
    await player3.waitForMessage("gameplay.bid.player_fold", {
      player: 2,
    });

    await player0.waitForMessage("gameplay.bid.bid_winner", { player: 0 });
    await player1.waitForMessage("gameplay.bid.bid_winner", { player: 0 });
    await player2.waitForMessage("gameplay.bid.bid_winner", { player: 0 });
    await player3.waitForMessage("gameplay.bid.bid_winner", { player: 0 });

    await player0.waitForMessage("gameplay.pre_play.trump_choosing", {
      player: 0,
    });
    await player1.waitForMessage("gameplay.pre_play.trump_choosing", {
      player: 0,
    });
    await player2.waitForMessage("gameplay.pre_play.trump_choosing", {
      player: 0,
    });
    await player3.waitForMessage("gameplay.pre_play.trump_choosing", {
      player: 0,
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
          player: 0,
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

      player: 0,
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
      player: 0,
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
      player: 0,
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
          player: 1,
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
      player: 1,
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
      player: 1,
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
      player: 1,
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
          player: 2,
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
          player: 2,
        },
      })
    );

    // players receive messages of player2's melds
    await player0.waitForMessage("gameplay.pre_play.player_meld_added", {
      meld: {
        type: "trump-nine",
        cards: ["9S"],
      },
      player: 2,
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
      player: 2,
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
      player: 2,
      points: [
        [50, 0],
        [20, 0],
      ],
    });

    //...and then they receive messages that he committed them
    await player0.waitForMessage("gameplay.pre_play.player_melds_committed", {
      player: 2,
    });
    await player1.waitForMessage("gameplay.pre_play.player_melds_committed", {
      player: 2,
    });
    await player3.waitForMessage("gameplay.pre_play.player_melds_committed", {
      player: 2,
    });

    // player0 now remembers he has a pinochle
    player0.send(
      JSON.stringify({
        event: "gameplay.pre_play.player_add_meld",
        data: {
          player: 0,
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
      player: 0,
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
      player: 0,
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
      player: 0,
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
          player: 0,
        },
      })
    );

    // player1 commits melds at same time
    player0.send(
      JSON.stringify({
        event: "gameplay.pre_play.player_commit_melds",
        data: {
          player: 1,
        },
      })
    );

    await player1.waitForMessage("gameplay.pre_play.player_melds_committed", {
      player: 0,
    });
    await player2.waitForMessage("gameplay.pre_play.player_melds_committed", {
      player: 0,
    });
    await player3.waitForMessage("gameplay.pre_play.player_melds_committed", {
      player: 0,
    });

    await player0.waitForMessage("gameplay.pre_play.player_melds_committed", {
      player: 1,
    });
    await player2.waitForMessage("gameplay.pre_play.player_melds_committed", {
      player: 1,
    });
    await player3.waitForMessage("gameplay.pre_play.player_melds_committed", {
      player: 1,
    });

    // player3 submits his 9 trump
    player3.send(
      JSON.stringify({
        event: "gameplay.pre_play.player_add_meld",
        data: {
          player: 3,
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
      player: 3,
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
      player: 3,
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
      player: 3,
      points: [
        [90, 0],
        [30, 0],
      ],
    });

    player3.send(
      JSON.stringify({
        event: "gameplay.pre_play.player_commit_melds",
        data: {
          player: 3,
        },
      })
    );

    await player0.waitForMessage("gameplay.pre_play.player_melds_committed", {
      player: 3,
    });
    await player1.waitForMessage("gameplay.pre_play.player_melds_committed", {
      player: 3,
    });
    await player2.waitForMessage("gameplay.pre_play.player_melds_committed", {
      player: 3,
    });

    await player0.waitForMessage("gameplay.play.play_start");
    await player1.waitForMessage("gameplay.play.play_start");
    await player2.waitForMessage("gameplay.play.play_start");
    await player3.waitForMessage("gameplay.play.play_start");

    // the play

    // round one

    // player 0 won the bid, so they should play first
    await player0.waitForMessage("gameplay.play.player_turn", { player: 0 });
    await player1.waitForMessage("gameplay.play.player_turn", { player: 0 });
    await player2.waitForMessage("gameplay.play.player_turn", { player: 0 });
    await player3.waitForMessage("gameplay.play.player_turn", { player: 0 });

    player0.send(
      JSON.stringify({
        event: "gameplay.play.player_play_card",
        data: { card: "AC", player: 0 },
      })
    );

    await player1.waitForMessage("gameplay.play.player_play_card", {
      player: 0,
      card: "AC",
    });
    await player2.waitForMessage("gameplay.play.player_play_card", {
      player: 0,
      card: "AC",
    });
    await player3.waitForMessage("gameplay.play.player_play_card", {
      player: 0,
      card: "AC",
    });

    await player0.waitForMessage("gameplay.play.player_turn", { player: 1 });
    await player1.waitForMessage("gameplay.play.player_turn", { player: 1 });
    await player2.waitForMessage("gameplay.play.player_turn", { player: 1 });
    await player3.waitForMessage("gameplay.play.player_turn", { player: 1 });

    player1.send(
      JSON.stringify({
        event: "gameplay.play.player_play_card",
        data: { card: "QC", player: 1 },
      })
    );

    await player0.waitForMessage("gameplay.play.player_play_card", {
      player: 1,
      card: "QC",
    });
    await player2.waitForMessage("gameplay.play.player_play_card", {
      player: 1,
      card: "QC",
    });
    await player3.waitForMessage("gameplay.play.player_play_card", {
      player: 1,
      card: "QC",
    });

    await player0.waitForMessage("gameplay.play.player_turn", { player: 2 });
    await player1.waitForMessage("gameplay.play.player_turn", { player: 2 });
    await player2.waitForMessage("gameplay.play.player_turn", { player: 2 });
    await player3.waitForMessage("gameplay.play.player_turn", { player: 2 });

    player2.send(
      JSON.stringify({
        event: "gameplay.play.player_play_card",
        data: { card: "QC", player: 2 },
      })
    );

    await player0.waitForMessage("gameplay.play.player_play_card", {
      player: 2,
      card: "QC",
    });
    await player1.waitForMessage("gameplay.play.player_play_card", {
      player: 2,
      card: "QC",
    });
    await player3.waitForMessage("gameplay.play.player_play_card", {
      player: 2,
      card: "QC",
    });

    await player0.waitForMessage("gameplay.play.player_turn", { player: 3 });
    await player1.waitForMessage("gameplay.play.player_turn", { player: 3 });
    await player2.waitForMessage("gameplay.play.player_turn", { player: 3 });
    await player3.waitForMessage("gameplay.play.player_turn", { player: 3 });

    player3.send(
      JSON.stringify({
        event: "gameplay.play.player_play_card",
        data: { card: "9C", player: 3 },
      })
    );

    await player0.waitForMessage("gameplay.play.player_play_card", {
      player: 3,
      card: "9C",
    });
    await player1.waitForMessage("gameplay.play.player_play_card", {
      player: 3,
      card: "9C",
    });
    await player2.waitForMessage("gameplay.play.player_play_card", {
      player: 3,
      card: "9C",
    });

    await player0.waitForMessage("gameplay.play.trick_end", {
      winning_player: 0,
      points: [
        [90, 20],
        [30, 0],
      ],
    });
    await player1.waitForMessage("gameplay.play.trick_end", {
      winning_player: 0,
      points: [
        [90, 20],
        [30, 0],
      ],
    });
    await player2.waitForMessage("gameplay.play.trick_end", {
      winning_player: 0,
      points: [
        [90, 20],
        [30, 0],
      ],
    });
    await player3.waitForMessage("gameplay.play.trick_end", {
      winning_player: 0,
      points: [
        [90, 20],
        [30, 0],
      ],
    });

    // round 2

    // player 0 won the trick, so he starts the next one
    await player0.waitForMessage("gameplay.play.player_turn", { player: 0 });
    await player1.waitForMessage("gameplay.play.player_turn", { player: 0 });
    await player2.waitForMessage("gameplay.play.player_turn", { player: 0 });
    await player3.waitForMessage("gameplay.play.player_turn", { player: 0 });

    player0.send(
      JSON.stringify({
        event: "gameplay.play.player_play_card",
        data: { card: "QH", player: 0 },
      })
    );

    await player1.waitForMessage("gameplay.play.player_play_card", {
      player: 0,
      card: "QH",
    });
    await player2.waitForMessage("gameplay.play.player_play_card", {
      player: 0,
      card: "QH",
    });
    await player3.waitForMessage("gameplay.play.player_play_card", {
      player: 0,
      card: "QH",
    });

    await player0.waitForMessage("gameplay.play.player_turn", { player: 1 });
    await player1.waitForMessage("gameplay.play.player_turn", { player: 1 });
    await player2.waitForMessage("gameplay.play.player_turn", { player: 1 });
    await player3.waitForMessage("gameplay.play.player_turn", { player: 1 });

    player1.send(
      JSON.stringify({
        event: "gameplay.play.player_play_card",
        data: { card: "AH", player: 1 },
      })
    );

    await player0.waitForMessage("gameplay.play.player_play_card", {
      player: 1,
      card: "AH",
    });
    await player2.waitForMessage("gameplay.play.player_play_card", {
      player: 1,
      card: "AH",
    });
    await player3.waitForMessage("gameplay.play.player_play_card", {
      player: 1,
      card: "AH",
    });

    await player0.waitForMessage("gameplay.play.player_turn", { player: 2 });
    await player1.waitForMessage("gameplay.play.player_turn", { player: 2 });
    await player2.waitForMessage("gameplay.play.player_turn", { player: 2 });
    await player3.waitForMessage("gameplay.play.player_turn", { player: 2 });

    player2.send(
      JSON.stringify({
        event: "gameplay.play.player_play_card",
        data: { card: "QH", player: 2 },
      })
    );

    await player0.waitForMessage("gameplay.play.player_play_card", {
      player: 2,
      card: "QH",
    });
    await player1.waitForMessage("gameplay.play.player_play_card", {
      player: 2,
      card: "QH",
    });
    await player3.waitForMessage("gameplay.play.player_play_card", {
      player: 2,
      card: "QH",
    });

    await player0.waitForMessage("gameplay.play.player_turn", { player: 3 });
    await player1.waitForMessage("gameplay.play.player_turn", { player: 3 });
    await player2.waitForMessage("gameplay.play.player_turn", { player: 3 });
    await player3.waitForMessage("gameplay.play.player_turn", { player: 3 });

    player3.send(
      JSON.stringify({
        event: "gameplay.play.player_play_card",
        data: { card: "10H", player: 3 },
      })
    );

    await player0.waitForMessage("gameplay.play.player_play_card", {
      player: 3,
      card: "10H",
    });
    await player1.waitForMessage("gameplay.play.player_play_card", {
      player: 3,
      card: "10H",
    });
    await player2.waitForMessage("gameplay.play.player_play_card", {
      player: 3,
      card: "10H",
    });

    await player0.waitForMessage("gameplay.play.trick_end", {
      winning_player: 1,
      points: [
        [90, 20],
        [30, 30],
      ],
    });
    await player1.waitForMessage("gameplay.play.trick_end", {
      winning_player: 1,
      points: [
        [90, 20],
        [30, 30],
      ],
    });
    await player2.waitForMessage("gameplay.play.trick_end", {
      winning_player: 1,
      points: [
        [90, 20],
        [30, 30],
      ],
    });
    await player3.waitForMessage("gameplay.play.trick_end", {
      winning_player: 1,
      points: [
        [90, 20],
        [30, 30],
      ],
    });

    // round 3
    // player 1 won the trick, so he starts the next one
    await player0.waitForMessage("gameplay.play.player_turn", { player: 1 });
    await player1.waitForMessage("gameplay.play.player_turn", { player: 1 });
    await player2.waitForMessage("gameplay.play.player_turn", { player: 1 });
    await player3.waitForMessage("gameplay.play.player_turn", { player: 1 });

    player1.send(
      JSON.stringify({
        event: "gameplay.play.player_play_card",
        data: { card: "AS", player: 1 },
      })
    );

    await player0.waitForMessage("gameplay.play.player_play_card", {
      player: 1,
      card: "AS",
    });
    await player2.waitForMessage("gameplay.play.player_play_card", {
      player: 1,
      card: "AS",
    });
    await player3.waitForMessage("gameplay.play.player_play_card", {
      player: 1,
      card: "AS",
    });

    await player0.waitForMessage("gameplay.play.player_turn", { player: 2 });
    await player1.waitForMessage("gameplay.play.player_turn", { player: 2 });
    await player2.waitForMessage("gameplay.play.player_turn", { player: 2 });
    await player3.waitForMessage("gameplay.play.player_turn", { player: 2 });

    player2.send(
      JSON.stringify({
        event: "gameplay.play.player_play_card",
        data: { card: "9S", player: 2 },
      })
    );

    await player0.waitForMessage("gameplay.play.player_play_card", {
      player: 2,
      card: "9S",
    });
    await player1.waitForMessage("gameplay.play.player_play_card", {
      player: 2,
      card: "9S",
    });
    await player3.waitForMessage("gameplay.play.player_play_card", {
      player: 2,
      card: "9S",
    });

    await player0.waitForMessage("gameplay.play.player_turn", { player: 3 });
    await player1.waitForMessage("gameplay.play.player_turn", { player: 3 });
    await player2.waitForMessage("gameplay.play.player_turn", { player: 3 });
    await player3.waitForMessage("gameplay.play.player_turn", { player: 3 });

    player3.send(
      JSON.stringify({
        event: "gameplay.play.player_play_card",
        data: { card: "KS", player: 3 },
      })
    );

    await player0.waitForMessage("gameplay.play.player_play_card", {
      player: 3,
      card: "KS",
    });
    await player1.waitForMessage("gameplay.play.player_play_card", {
      player: 3,
      card: "KS",
    });
    await player2.waitForMessage("gameplay.play.player_play_card", {
      player: 3,
      card: "KS",
    });

    await player0.waitForMessage("gameplay.play.player_turn", { player: 0 });
    await player1.waitForMessage("gameplay.play.player_turn", { player: 0 });
    await player2.waitForMessage("gameplay.play.player_turn", { player: 0 });
    await player3.waitForMessage("gameplay.play.player_turn", { player: 0 });

    player0.send(
      JSON.stringify({
        event: "gameplay.play.player_play_card",
        data: { card: "QS", player: 0 },
      })
    );

    await player1.waitForMessage("gameplay.play.player_play_card", {
      player: 0,
      card: "QS",
    });
    await player2.waitForMessage("gameplay.play.player_play_card", {
      player: 0,
      card: "QS",
    });
    await player3.waitForMessage("gameplay.play.player_play_card", {
      player: 0,
      card: "QS",
    });

    await player0.waitForMessage("gameplay.play.trick_end", {
      winning_player: 1,
      points: [
        [90, 20],
        [30, 50],
      ],
    });
    await player1.waitForMessage("gameplay.play.trick_end", {
      winning_player: 1,
      points: [
        [90, 20],
        [30, 50],
      ],
    });
    await player2.waitForMessage("gameplay.play.trick_end", {
      winning_player: 1,
      points: [
        [90, 20],
        [30, 50],
      ],
    });
    await player3.waitForMessage("gameplay.play.trick_end", {
      winning_player: 1,
      points: [
        [90, 20],
        [30, 50],
      ],
    });

    // player 1 won the trick, so he starts the next one
    await player0.waitForMessage("gameplay.play.player_turn", { player: 1 });
    await player1.waitForMessage("gameplay.play.player_turn", { player: 1 });
    await player2.waitForMessage("gameplay.play.player_turn", { player: 1 });
    await player3.waitForMessage("gameplay.play.player_turn", { player: 1 });

    player1.send(
      JSON.stringify({
        event: "gameplay.play.player_play_card",
        data: { card: "QD", player: 1 },
      })
    );

    await player0.waitForMessage("gameplay.play.player_play_card", {
      player: 1,
      card: "QD",
    });
    await player2.waitForMessage("gameplay.play.player_play_card", {
      player: 1,
      card: "QD",
    });
    await player3.waitForMessage("gameplay.play.player_play_card", {
      player: 1,
      card: "QD",
    });

    await player0.waitForMessage("gameplay.play.player_turn", { player: 2 });
    await player1.waitForMessage("gameplay.play.player_turn", { player: 2 });
    await player2.waitForMessage("gameplay.play.player_turn", { player: 2 });
    await player3.waitForMessage("gameplay.play.player_turn", { player: 2 });

    player2.send(
      JSON.stringify({
        event: "gameplay.play.player_play_card",
        data: { card: "9D", player: 2 },
      })
    );

    await player0.waitForMessage("gameplay.play.player_play_card", {
      player: 2,
      card: "9D",
    });
    await player1.waitForMessage("gameplay.play.player_play_card", {
      player: 2,
      card: "9D",
    });
    await player3.waitForMessage("gameplay.play.player_play_card", {
      player: 2,
      card: "9D",
    });

    await player0.waitForMessage("gameplay.play.player_turn", { player: 3 });
    await player1.waitForMessage("gameplay.play.player_turn", { player: 3 });
    await player2.waitForMessage("gameplay.play.player_turn", { player: 3 });
    await player3.waitForMessage("gameplay.play.player_turn", { player: 3 });

    player3.send(
      JSON.stringify({
        event: "gameplay.play.player_play_card",
        data: { card: "AD", player: 3 },
      })
    );

    await player0.waitForMessage("gameplay.play.player_play_card", {
      player: 3,
      card: "AD",
    });
    await player1.waitForMessage("gameplay.play.player_play_card", {
      player: 3,
      card: "AD",
    });
    await player2.waitForMessage("gameplay.play.player_play_card", {
      player: 3,
      card: "AD",
    });

    await player0.waitForMessage("gameplay.play.player_turn", { player: 0 });
    await player1.waitForMessage("gameplay.play.player_turn", { player: 0 });
    await player2.waitForMessage("gameplay.play.player_turn", { player: 0 });
    await player3.waitForMessage("gameplay.play.player_turn", { player: 0 });

    player0.send(
      JSON.stringify({
        event: "gameplay.play.player_play_card",
        data: { card: "JD", player: 0 },
      })
    );

    await player1.waitForMessage("gameplay.play.player_play_card", {
      player: 0,
      card: "JD",
    });
    await player2.waitForMessage("gameplay.play.player_play_card", {
      player: 0,
      card: "JD",
    });
    await player3.waitForMessage("gameplay.play.player_play_card", {
      player: 0,
      card: "JD",
    });

    await player0.waitForMessage("gameplay.play.trick_end", {
      winning_player: 3,
      points: [
        [90, 20],
        [30, 65],
      ],
    });
    await player1.waitForMessage("gameplay.play.trick_end", {
      winning_player: 3,
      points: [
        [90, 20],
        [30, 65],
      ],
    });
    await player2.waitForMessage("gameplay.play.trick_end", {
      winning_player: 3,
      points: [
        [90, 20],
        [30, 65],
      ],
    });
    await player3.waitForMessage("gameplay.play.trick_end", {
      winning_player: 3,
      points: [
        [90, 20],
        [30, 65],
      ],
    });

    // player 3 won the trick, so he starts the next one
    await player0.waitForMessage("gameplay.play.player_turn", { player: 3 });
    await player1.waitForMessage("gameplay.play.player_turn", { player: 3 });
    await player2.waitForMessage("gameplay.play.player_turn", { player: 3 });
    await player3.waitForMessage("gameplay.play.player_turn", { player: 3 });

    player3.send(
      JSON.stringify({
        event: "gameplay.play.player_play_card",
        data: { card: "AD", player: 3 },
      })
    );

    await player0.waitForMessage("gameplay.play.player_play_card", {
      player: 3,
      card: "AD",
    });
    await player1.waitForMessage("gameplay.play.player_play_card", {
      player: 3,
      card: "AD",
    });
    await player2.waitForMessage("gameplay.play.player_play_card", {
      player: 3,
      card: "AD",
    });

    await player0.waitForMessage("gameplay.play.player_turn", { player: 0 });
    await player1.waitForMessage("gameplay.play.player_turn", { player: 0 });
    await player2.waitForMessage("gameplay.play.player_turn", { player: 0 });
    await player3.waitForMessage("gameplay.play.player_turn", { player: 0 });

    player0.send(
      JSON.stringify({
        event: "gameplay.play.player_play_card",
        data: { card: "KD", player: 0 },
      })
    );

    await player1.waitForMessage("gameplay.play.player_play_card", {
      player: 0,
      card: "KD",
    });
    await player2.waitForMessage("gameplay.play.player_play_card", {
      player: 0,
      card: "KD",
    });
    await player3.waitForMessage("gameplay.play.player_play_card", {
      player: 0,
      card: "KD",
    });

    await player0.waitForMessage("gameplay.play.player_turn", { player: 1 });
    await player1.waitForMessage("gameplay.play.player_turn", { player: 1 });
    await player2.waitForMessage("gameplay.play.player_turn", { player: 1 });
    await player3.waitForMessage("gameplay.play.player_turn", { player: 1 });

    player1.send(
      JSON.stringify({
        event: "gameplay.play.player_play_card",
        data: { card: "10D", player: 1 },
      })
    );

    await player0.waitForMessage("gameplay.play.player_play_card", {
      player: 1,
      card: "10D",
    });
    await player2.waitForMessage("gameplay.play.player_play_card", {
      player: 1,
      card: "10D",
    });
    await player3.waitForMessage("gameplay.play.player_play_card", {
      player: 1,
      card: "10D",
    });

    await player0.waitForMessage("gameplay.play.player_turn", { player: 2 });
    await player1.waitForMessage("gameplay.play.player_turn", { player: 2 });
    await player2.waitForMessage("gameplay.play.player_turn", { player: 2 });
    await player3.waitForMessage("gameplay.play.player_turn", { player: 2 });

    player2.send(
      JSON.stringify({
        event: "gameplay.play.player_play_card",
        data: { card: "JD", player: 2 },
      })
    );

    await player0.waitForMessage("gameplay.play.player_play_card", {
      player: 2,
      card: "JD",
    });
    await player1.waitForMessage("gameplay.play.player_play_card", {
      player: 2,
      card: "JD",
    });
    await player3.waitForMessage("gameplay.play.player_play_card", {
      player: 2,
      card: "JD",
    });

    await player0.waitForMessage("gameplay.play.trick_end", {
      winning_player: 3,
      points: [
        [90, 20],
        [30, 90],
      ],
    });
    await player1.waitForMessage("gameplay.play.trick_end", {
      winning_player: 3,
      points: [
        [90, 20],
        [30, 90],
      ],
    });
    await player2.waitForMessage("gameplay.play.trick_end", {
      winning_player: 3,
      points: [
        [90, 20],
        [30, 90],
      ],
    });
    await player3.waitForMessage("gameplay.play.trick_end", {
      winning_player: 3,
      points: [
        [90, 20],
        [30, 90],
      ],
    });
  });
});
