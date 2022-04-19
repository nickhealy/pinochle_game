import { assign, createMachine } from "xstate";
import { sendParent } from "xstate/lib/actions";
import Connection from "../networking/types";
import webRTCConnect from "../networking/webrtc";
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
      connection_ref: null,
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
          src: webRTCConnect,
          onDone: {
            target: "connected",
            actions: ["saveConnectionRef"],
          },
          onError: {
            actions: [
              "sendConnectionFail",
              (_, evt) =>
                console.log("Error connecting to remote client : ", evt.data),
            ],
            target: "idle",
          },
        },
      },
      connected: {
        entry: ["sendConnected"],
        invoke: {
          id: "heartbeat",
          src: () => {
            return Promise.resolve();
          },
          onError: {
            actions: "sendHeartbeatFail",
          },
        },
        on: {
          GAMEPLAY_UPDATE: {
            actions: ["enqueueAction", "sendAction"],
          },
          NO_OP: {}, // FIXME : look into if this is actually necessary
        },
      },
    },
  },
  {
    actions: {
      saveMetadata: assign({
        connection_metadata: (_, evt) => evt.metadata,
      }),
      saveConnectionRef: assign({
        connection_ref: (_, evt) => evt.data as Connection,
      }),
      sendConnected: sendParent((ctx) => ({
        type: "PLAYER_CONNECTED",
        metadata: ctx.connection_metadata,
      })),
      sendConnectionFail: sendParent((ctx) => ({
        type: "PLAYER_CONNECTION_FAIL",
        metadata: ctx.connection_metadata,
      })),
      sendHeartbeatFail: sendParent((ctx) => ({
        type: "FAILED_HEARTBEAT",
        metadata: ctx.connection_metadata,
      })),
      enqueueAction: assign({
        outgoing_queue: (ctx, evt) => [...ctx.outgoing_queue, evt.action_data],
      }),
    },
  }
);

export default ConnectionWorkerMachine;
