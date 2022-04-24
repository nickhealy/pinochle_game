import { interpret } from "xstate";
import waitForExpect from "wait-for-expect";
import { getTestClient } from "../../networking/__tests__/mockClient";
import ConnectionSupervisorMachine from "../machine";

jest.mock("../../networking/webrtc");

describe("ConnectionSupervisorMachine", () => {
  fit("can handle players joining the room", async () => {
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
      // P1
      expect(player1.onmessage).toBeCalledTimes(4);
      expect(player1.onmessage).toHaveBeenNthCalledWith(
        1,
        JSON.stringify({
          type: "lobby.room_description",
          data: {
            players: [{ name: "nick" }],
          },
        })
      );
      expect(player1.onmessage).toHaveBeenNthCalledWith(
        2,
        JSON.stringify({
          type: "lobby.player_join",
          data: {
            player_info: { name: "annabelle" },
          },
        })
      );
      expect(player1.onmessage).toHaveBeenNthCalledWith(
        3,
        JSON.stringify({
          type: "lobby.player_join",
          data: {
            player_info: { name: "scott" },
          },
        })
      );
      expect(player1.onmessage).toHaveBeenNthCalledWith(
        4,
        JSON.stringify({
          type: "lobby.player_join",
          data: {
            player_info: { name: "chris" },
          },
        })
      );
      // P2
      expect(player2.onmessage).toBeCalledTimes(3);
      expect(player2.onmessage).toHaveBeenNthCalledWith(
        1,
        JSON.stringify({
          type: "lobby.room_description",
          data: {
            players: [{ name: "nick" }, { name: "annabelle" }],
          },
        })
      );
      expect(player2.onmessage).toHaveBeenNthCalledWith(
        2,
        JSON.stringify({
          type: "lobby.player_join",
          data: {
            player_info: { name: "scott" },
          },
        })
      );
      expect(player2.onmessage).toHaveBeenNthCalledWith(
        3,
        JSON.stringify({
          type: "lobby.player_join",
          data: {
            player_info: { name: "chris" },
          },
        })
      );
      // P3
      expect(player3.onmessage).toBeCalledTimes(2);
      expect(player3.onmessage).toHaveBeenNthCalledWith(
        1,
        JSON.stringify({
          type: "lobby.room_description",
          data: {
            players: [
              { name: "nick" },
              { name: "annabelle" },
              { name: "scott" },
            ],
          },
        })
      );
      expect(player3.onmessage).toHaveBeenNthCalledWith(
        2,
        JSON.stringify({
          type: "lobby.player_join",
          data: {
            player_info: { name: "chris" },
          },
        })
      );
      // P4
      expect(player4.onmessage).toBeCalledTimes(1);
      expect(player4.onmessage).toHaveBeenNthCalledWith(
        1,
        JSON.stringify({
          type: "lobby.room_description",
          data: {
            players: [
              { name: "nick" },
              { name: "annabelle" },
              { name: "scott" },
              { name: "chris" },
            ],
          },
        })
      );
    });
  });

  it("can handle game start", async () => {
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

    player1.send(
      JSON.stringify({
        type: "start_game",
      })
    );

    await waitForExpect(() => {
      expect(player1.onmessage).toHaveBeenCalledWith(
        JSON.stringify({
          type: "lobby.start_game",
        })
      );
      expect(player2.onmessage).toHaveBeenCalledWith(
        JSON.stringify({
          type: "lobby.start_game",
        })
      );
      expect(player3.onmessage).toHaveBeenCalledWith(
        JSON.stringify({
          type: "lobby.start_game",
        })
      );
      expect(player4.onmessage).toHaveBeenCalledWith(
        JSON.stringify({
          type: "lobby.start_game",
        })
      );
    });
  });
});
