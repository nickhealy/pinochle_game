import { createMachine } from "xstate";
import { ConnectionWorkerContext, ConnectionWorkerEvent } from "./types";

const ConnectionWorkerMachine = createMachine(
  {
    preserveActionOrder: true,
    tsTypes: {} as import("./machine.typegen").Typegen0,
    schema: {
      context: {} as ConnectionWorkerContext,
      events: {} as ConnectionWorkerEvent,
    },
    id: "ConnectionWorkerMachine",
    states: {
      idle: {
        on: {
          CONNECT: {
            actions: "connect",
            target: "connecting",
          },
        },
      },
      connecting: {
        on: {
          CONNECTED: {
            target: "connected",
          },
        },
      },
      connected: {
        on: {
          PLAYER_ACTION: {
            actions: "handlePlayerAction",
          },
        },
      },
    },
  },
  {
    actions: {
      connect: () => {},
    },
  }
);

export default ConnectionWorkerMachine;
