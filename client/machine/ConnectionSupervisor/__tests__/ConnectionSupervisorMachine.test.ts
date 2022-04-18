import { interpret } from "xstate";
import ConnectionSupervisorMachine from "../machine";

jest.useFakeTimers();

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

    supervisorService.send({
      type: "PLAYER_JOIN_REQUEST",
      metadata: "metadata_1",
    });
    supervisorService.send({
      type: "PLAYER_JOIN_REQUEST",
      metadata: "metadata_2",
    });
    supervisorService.send({
      type: "PLAYER_JOIN_REQUEST",
      metadata: "metadata_3",
    });
    supervisorService.send({
      type: "PLAYER_JOIN_REQUEST",
      metadata: "metadata_4",
    });

    jest.runAllTimers();
  });
});
