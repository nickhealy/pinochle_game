import waitForExpect from "wait-for-expect";
import { interpret } from "xstate";
import ConnectionSupervisorMachine from "../ConnectionSupervisor/machine";
import { getTestClient } from "../networking/__tests__/mockClient";

jest.mock("../gameplay/Deck");
jest.mock("../networking/webrtc");

describe("integration test", () => {
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
  });
});
