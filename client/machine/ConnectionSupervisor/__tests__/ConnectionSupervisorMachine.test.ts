import { createMachine, interpret } from "xstate";
import { getTestClient } from "../../networking/__tests__/mockClient";
import ConnectionSupervisorMachine from "../machine";

jest.mock("../../networking/webrtc");

describe("ConnectionSupervisorMachine", () => {
  it("can handle players joining the room", (done) => {
    const supervisorService = interpret(
      ConnectionSupervisorMachine
    ).onTransition((state) => {
      if (state.matches("ready")) {
        done();
      }
    });
    supervisorService.start();

    const [player1] = getTestClient();
    const [player2] = getTestClient();
    const [player3] = getTestClient();
    const [player4] = getTestClient();

    supervisorService.send({
      type: "PLAYER_JOIN_REQUEST",
      metadata: player1.id,
    });
    supervisorService.send({
      type: "PLAYER_JOIN_REQUEST",
      metadata: player2.id,
    });
    supervisorService.send({
      type: "PLAYER_JOIN_REQUEST",
      metadata: player3.id,
    });
    supervisorService.send({
      type: "PLAYER_JOIN_REQUEST",
      metadata: player4.id,
    });
  });
});
