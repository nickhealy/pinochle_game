import { assign, createMachine } from "xstate";
import { log, pure, send, sendParent } from "xstate/lib/actions";
import { ConnectionWorkerContext, ConnectionWorkerEvent } from "./types";

const ConnectionWorkerMachine = createMachine(
  {
    preserveActionOrder: true,
    tsTypes: {} as import("./machine.typegen").Typegen0,
    schema: {
      context: {} as ConnectionWorkerContext,
      events: {} as ConnectionWorkerEvent,
    },
    context: {
      incoming_queue: [],
      outgoing_queue: [],
      last_heartbeat: undefined,
      connection_metadata: undefined,
    },
    id: "ConnectionWorkerMachine",
    initial: "idle",
    states: {
      idle: {
        on: {
          CONNECT: {
            actions: "saveMetadata",
            target: "connecting",
          },
        },
      },
      connecting: {
        invoke: {
          id: "webrtcConnection",
          src: () => {
            return new Promise((res, rej) => setTimeout(res, 1000));
          },
          onDone: {
            target: "connected",
          },
          onError: {
            actions: (_, evt) => console.log("error connecting : ", evt.data),
          },
        },
      },
      connected: {
        entry: ["sendConnected"],
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
      saveMetadata: assign({
        connection_metadata: (_, evt) => evt.metadata,
      }),
      sendConnected: sendParent((ctx, evt) => ({
        type: "PLAYER_CONNECTED",
        metadata: ctx.connection_metadata,
      })),
    },
  }
);

export default ConnectionWorkerMachine;
