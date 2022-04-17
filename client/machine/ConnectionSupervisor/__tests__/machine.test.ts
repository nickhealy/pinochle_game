import { interpret } from "xstate";
import ConnectionSupervisorMachine from "../machine";

describe("ConnectionSupervisorMachine", () => {
  it("can handle players joining the room", () => {
    const supervisorService = interpret(ConnectionSupervisorMachine);
    supervisorService.start();

    supervisorService.send({
      type: "PLAYER_JOIN_REQUEST",
      info: "",
    });
    supervisorService.send({
      type: "PLAYER_JOIN_REQUEST",
      info: "test_metadata",
    });
    supervisorService.send({
      type: "PLAYER_JOIN_REQUEST",
      info: "test_metadata",
    });
    supervisorService.send({
      type: "PLAYER_JOIN_REQUEST",
      info: "test_metadata",
    });
  });
});
