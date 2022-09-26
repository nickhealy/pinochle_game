import { interpret } from "xstate";
import { getTestClient } from "../../networking/__tests__/mockClient";
import ConnectionSupervisorMachine from "../machine";

jest.mock("../../networking/webrtc");
jest.mock("../../../inversify.config");

describe("ConnectionSupervisorMachine", () => {
  it("can handle players joining the room", async () => {
    const [player0] = getTestClient();
    const [player1] = getTestClient();
    const [player2] = getTestClient();
    const [player3] = getTestClient();

    const supervisorService = interpret(ConnectionSupervisorMachine);
    supervisorService.start();

    // P0 joins
    supervisorService.send({
      type: "PLAYER_JOIN_REQUEST",
      connection_info: player0.metadata,
      name: "nick",
    });
    await player0.waitForMessage("lobby.room_description", {
      players: [{ name: "nick", id: player0.id }],
      own_id: player0.id,
    });

    // P1 joins
    supervisorService.send({
      type: "PLAYER_JOIN_REQUEST",
      connection_info: player1.metadata,
      name: "annabelle",
    });
    await player0.waitForMessage("lobby.player_join", {
      player_info: { name: "annabelle", id: player1.id },
    });
    await player1.waitForMessage("lobby.room_description", {
      players: [
        { name: "nick", id: player0.id },
        { name: "annabelle", id: player1.id },
      ],
      own_id: player1.id,
    });

    // P2 joins
    supervisorService.send({
      type: "PLAYER_JOIN_REQUEST",
      connection_info: player2.metadata,
      name: "scott",
    });
    await player0.waitForMessage("lobby.player_join", {
      player_info: { name: "scott", id: player2.id },
    });
    await player1.waitForMessage("lobby.player_join", {
      player_info: { name: "scott", id: player2.id },
    });
    await player2.waitForMessage("lobby.room_description", {
      players: [
        { name: "nick", id: player0.id },
        { name: "annabelle", id: player1.id },
        { name: "scott", id: player2.id },
      ],
      own_id: player2.id,
    });

    // P3 joins
    supervisorService.send({
      type: "PLAYER_JOIN_REQUEST",
      connection_info: player3.metadata,
      name: "chris",
    });
    await player0.waitForMessage("lobby.player_join", {
      player_info: { name: "chris", id: player3.id },
    });
    await player1.waitForMessage("lobby.player_join", {
      player_info: { name: "chris", id: player3.id },
    });
    await player2.waitForMessage("lobby.player_join", {
      player_info: { name: "chris", id: player3.id },
    });
    await player3.waitForMessage("lobby.room_description", {
      players: [
        { name: "nick", id: player0.id },
        { name: "annabelle", id: player1.id },
        { name: "scott", id: player2.id },
        { name: "chris", id: player3.id },
      ],
      own_id: player3.id,
    });

    await player0.waitForMessage("lobby.all_players_connected");
    await player1.waitForMessage("lobby.all_players_connected");
    await player2.waitForMessage("lobby.all_players_connected");
    await player3.waitForMessage("lobby.all_players_connected");
  });

  it("can handle game start", async () => {
    const [player0] = getTestClient();
    const [player1] = getTestClient();
    const [player2] = getTestClient();
    const [player3] = getTestClient();

    const supervisorService = interpret(ConnectionSupervisorMachine);
    supervisorService.start();

    supervisorService.send({
      type: "PLAYER_JOIN_REQUEST",
      connection_info: player0.metadata,
      name: "nick",
    });
    supervisorService.send({
      type: "PLAYER_JOIN_REQUEST",
      connection_info: player1.metadata,
      name: "annabelle",
    });
    supervisorService.send({
      type: "PLAYER_JOIN_REQUEST",
      connection_info: player2.metadata,
      name: "scott",
    });
    supervisorService.send({
      type: "PLAYER_JOIN_REQUEST",
      connection_info: player3.metadata,
      name: "chris",
    });

    await player0.waitForMessage("lobby.all_players_connected");

    player0.send(
      JSON.stringify({
        event: "lobby.start_game",
      })
    );

    await player0.waitForMessage("lobby.game_start");
    await player1.waitForMessage("lobby.game_start");
    await player2.waitForMessage("lobby.game_start");
    await player3.waitForMessage("lobby.game_start");
  });
});
