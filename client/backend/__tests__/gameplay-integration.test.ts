import { mockRandom } from "jest-mock-random";
import waitForExpect from "wait-for-expect";
import { interpret } from "xstate";
import ConnectionSupervisorMachine from "../ConnectionSupervisor/machine";
import { getTestClient } from "../networking/__tests__/mockClient";

jest.mock("../gameplay/Deck");
jest.mock("../networking/webrtc");

const createMessageCount = () => {
  let count = 0;
  return () => count++;
};

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

    await waitForExpect(() => {
      expect(player0.onmessage).toHaveBeenCalledWith(
        JSON.stringify({
          type: "lobby.all_players_connected",
          data: {},
        })
      );
    });

    player3.send(
      JSON.stringify({
        event: "lobby.start_game",
      })
    );

    // getting teams
    await waitForExpect(() => {
      const teams = [
        [player0.id, player2.id],
        [player1.id, player3.id],
      ];
      expect(player0.onmessage).toHaveBeenCalledWith(
        JSON.stringify({
          type: "lobby.player_teams",
          data: {
            teams,
          },
        })
      );
      expect(player1.onmessage).toHaveBeenCalledWith(
        JSON.stringify({
          type: "lobby.player_teams",
          data: {
            teams,
          },
        })
      );
      expect(player2.onmessage).toHaveBeenCalledWith(
        JSON.stringify({
          type: "lobby.player_teams",
          data: {
            teams,
          },
        })
      );
      expect(player3.onmessage).toHaveBeenCalledWith(
        JSON.stringify({
          type: "lobby.player_teams",
          data: {
            teams,
          },
        })
      );
    });

    // game start
    await waitForExpect(() => {
      expect(player0.onmessage).toHaveBeenCalledWith(
        JSON.stringify({
          type: "lobby.game_start",
          data: {},
        })
      );
      expect(player1.onmessage).toHaveBeenCalledWith(
        JSON.stringify({
          type: "lobby.game_start",
          data: {},
        })
      );
      expect(player2.onmessage).toHaveBeenCalledWith(
        JSON.stringify({
          type: "lobby.game_start",
          data: {},
        })
      );
      expect(player3.onmessage).toHaveBeenCalledWith(
        JSON.stringify({
          type: "lobby.game_start",
          data: {},
        })
      );
    });

    // send cards to each player
    await waitForExpect(() => {
      // chris --- 0 , scott -- 1, nick -- 2, annabelle -- 3
      expect(player0.onmessage).toHaveBeenCalledWith(
        JSON.stringify({
          type: "gameplay.player_cards",
          data: {
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
          },
        })
      );

      expect(player1.onmessage).toHaveBeenCalledWith(
        JSON.stringify({
          type: "gameplay.player_cards",
          data: {
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
          },
        })
      );

      expect(player2.onmessage).toHaveBeenCalledWith(
        JSON.stringify({
          type: "gameplay.player_cards",
          data: {
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
          },
        })
      );

      expect(player3.onmessage).toHaveBeenCalledWith(
        JSON.stringify({
          type: "gameplay.player_cards",
          data: {
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
          },
        })
      );
    });

    // player @ index 1 (scott's) turn to make a bid
    await waitForExpect(() => {
      expect(player0.onmessage).toHaveBeenCalledWith(
        JSON.stringify({
          type: "gameplay.bid.awaiting_bid",
          data: { player: 1 },
        })
      );
      expect(player1.onmessage).toHaveBeenCalledWith(
        JSON.stringify({
          type: "gameplay.bid.awaiting_bid",
          data: { player: 1 },
        })
      );
      expect(player2.onmessage).toHaveBeenCalledWith(
        JSON.stringify({
          type: "gameplay.bid.awaiting_bid",
          data: { player: 1 },
        })
      );
      expect(player3.onmessage).toHaveBeenCalledWith(
        JSON.stringify({
          type: "gameplay.bid.awaiting_bid",
          data: { player: 1 },
        })
      );
    });

    player1.send(
      JSON.stringify({ event: "gameplay.bid.player_bid", data: { value: 140 } })
    );

    await waitForExpect(() => {
      expect(player0.onmessage).toHaveBeenCalledWith(
        JSON.stringify({
          type: "gameplay.bid.player_bid",
          data: { player: 1, bid: 140 },
        })
      );
      expect(player1.onmessage).not.toHaveBeenCalledWith(
        JSON.stringify({
          type: "gameplay.bid.player_bid",
          data: { player: 1, bid: 140 },
        })
      );
      expect(player2.onmessage).toHaveBeenCalledWith(
        JSON.stringify({
          type: "gameplay.bid.player_bid",
          data: { player: 1, bid: 140 },
        })
      );
      expect(player3.onmessage).toHaveBeenCalledWith(
        JSON.stringify({
          type: "gameplay.bid.player_bid",
          data: { player: 1, bid: 140 },
        })
      );
    });

    await waitForExpect(() => {
      expect(player0.onmessage).toHaveBeenCalledWith(
        JSON.stringify({
          type: "gameplay.bid.awaiting_bid",
          data: { player: 2 },
        })
      );
      expect(player1.onmessage).toHaveBeenCalledWith(
        JSON.stringify({
          type: "gameplay.bid.awaiting_bid",
          data: { player: 2 },
        })
      );
      expect(player2.onmessage).toHaveBeenCalledWith(
        JSON.stringify({
          type: "gameplay.bid.awaiting_bid",
          data: { player: 2 },
        })
      );
      expect(player3.onmessage).toHaveBeenCalledWith(
        JSON.stringify({
          type: "gameplay.bid.awaiting_bid",
          data: { player: 2 },
        })
      );
    });

    player2.send(
      JSON.stringify({ event: "gameplay.bid.player_bid", data: { value: 150 } })
    );

    await waitForExpect(() => {
      expect(player0.onmessage).toHaveBeenCalledWith(
        JSON.stringify({
          type: "gameplay.bid.player_bid",
          data: { player: 2, bid: 150 },
        })
      );
      expect(player1.onmessage).toHaveBeenCalledWith(
        JSON.stringify({
          type: "gameplay.bid.player_bid",
          data: { player: 2, bid: 150 },
        })
      );
      expect(player2.onmessage).not.toHaveBeenCalledWith(
        JSON.stringify({
          type: "gameplay.bid.player_bid",
          data: { player: 1, bid: 150 },
        })
      );
      expect(player3.onmessage).toHaveBeenCalledWith(
        JSON.stringify({
          type: "gameplay.bid.player_bid",
          data: { player: 2, bid: 150 },
        })
      );
    });
  });
});
