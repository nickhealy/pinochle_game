import { mockRandom } from "jest-mock-random";
import waitForExpect from "wait-for-expect";
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
    const [player1] = getTestClient();
    const [player2] = getTestClient();
    const [player3] = getTestClient();
    const [player4] = getTestClient();

    const supervisorService = interpret(ConnectionSupervisorMachine);
    supervisorService.start();

    supervisorService.send({
      type: "PLAYER_JOIN_REQUEST",
      connection_info: player1.id,
      name: "nick",
    });
    supervisorService.send({
      type: "PLAYER_JOIN_REQUEST",
      connection_info: player2.id,
      name: "annabelle",
    });
    supervisorService.send({
      type: "PLAYER_JOIN_REQUEST",
      connection_info: player3.id,
      name: "scott",
    });
    supervisorService.send({
      type: "PLAYER_JOIN_REQUEST",
      connection_info: player4.id,
      name: "chris",
    });

    await waitForExpect(() => {
      expect(player1.onmessage).toHaveBeenCalledWith(
        JSON.stringify({
          type: "lobby.all_players_connected",
          data: {},
        })
      );
    });

    player1.send(
      JSON.stringify({
        event: "lobby.start_game",
      })
    );

    // getting teams
    await waitForExpect(() => {
      const teams = [
        ["chris", "nick"],
        ["scott", "annabelle"],
      ];
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
      expect(player4.onmessage).toHaveBeenCalledWith(
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
      expect(player4.onmessage).toHaveBeenCalledWith(
        JSON.stringify({
          type: "lobby.game_start",
          data: {},
        })
      );
    });

    // send cards to each player
    await waitForExpect(() => {
      // chris --- 0 , scott -- 1, nick -- 2, annabelle -- 3
      expect(player4.onmessage).toHaveBeenCalledWith(
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

      expect(player3.onmessage).toHaveBeenCalledWith(
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

      expect(player1.onmessage).toHaveBeenCalledWith(
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

      expect(player2.onmessage).toHaveBeenCalledWith(
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
  });
});
