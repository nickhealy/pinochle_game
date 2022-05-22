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

    player2.send(
      JSON.stringify({
        event: "gameplay.pre_play.player_add_meld",
        data: {
          player: 2,
          meld: {
            type: "trump-nine",
            cards: ["9C"],
          },
        },
      })
    );

    await player0.waitForMessage("gameplay.pre_play.player_meld_added", {
      meld: {
        type: "trump-nine",
        cards: ["9C"],
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
        cards: ["9C"],
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
        cards: ["9C"],
      },
      player: 2,
      points: [
        [50, 0],
        [20, 0],
      ],
    });
  });
});
