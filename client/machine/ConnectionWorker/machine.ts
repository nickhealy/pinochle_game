import { assign, createMachine, DoneInvokeEvent, send } from "xstate";
import { sendParent } from "xstate/lib/actions";
import Connection from "../networking/types";
import getWebRtcConnection from "../networking/webrtc";
import {
  connectionExists,
  ConnectionWorkerContext,
  ConnectionWorkerEvent,
} from "./types";

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
          id: "getWebRtcConnection",
          src: async (ctx) =>
            await getWebRtcConnection(ctx.connection_metadata),
          onDone: {
            actions: ["sendSelfConnected"],
          },
          onError: {
            actions: [
              "sendConnectionFail",
              (_, evt) =>
                console.error("Error connecting to remote client : ", evt.data),
            ],
            target: "idle",
          },
        },
        on: {
          CONNECTED: {
            actions: ["sendConnected", "saveConnectionRef"],
            target: "connected",
          },
        },
      },
      connected: {
        invoke: {
          id: "rxtxLoop",
          src: (ctx) => (cb, onReceive) => {
            if (!connectionExists(ctx.connection_ref)) {
              throw new Error("Connection does not exists"); // should not get here
            }

            ctx.connection_ref.onmessage = (message) => {
              const parsedMessage = JSON.parse(message);
              switch (parsedMessage.type) {
                case "PLAYER_ACTION":
                  cb({
                    type: "PLAYER_ACTION",
                    action_data: parsedMessage.payload,
                  });
                  break;
                default:
                  console.error("Message not recognized : ", parsedMessage);
              }
            };

            onReceive((e) => {
              if (!connectionExists(ctx.connection_ref)) {
                throw new Error("Connection does not exists"); // should not get here
              }
              switch (e.type) {
                case "GAMEPLAY_UPDATE":
                  ctx.connection_ref.send(JSON.stringify(e.payload));
                  break;
                default:
                  console.error("Receieved event not recognized : ", e);
              }
            });
          },
        },
        on: {
          GAMEPLAY_UPDATE: {
            actions: ["forwardGameplayEvent"],
          },
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
      saveConnectionRef: assign({
        connection_ref: (_, evt) => evt.connection as Connection,
      }),
      sendSelfConnected: send((_, evt) => ({
        type: "CONNECTED",
        connection: evt.data,
      })),
      sendConnected: sendParent((ctx) => ({
        type: "PLAYER_CONNECTED",
        metadata: ctx.connection_metadata,
      })),
      sendConnectionFail: sendParent((ctx) => ({
        type: "PLAYER_CONNECTION_FAIL",
        metadata: ctx.connection_metadata,
      })),
      forwardGameplayEvent: send(
        (_, evt) => ({
          type: "GAMEPLAY_UPDATE",
          payload: evt.action_data,
        }),
        { to: "rxtxLoop" }
      ),
      // sendHeartbeatFail: sendParent((ctx) => ({
      //   type: "FAILED_HEARTBEAT",
      //   metadata: ctx.connection_metadata,
      // })),
      // enqueueAction: assign({
      //   outgoing_queue: (ctx, evt) => [...ctx.outgoing_queue, evt.action_data],
      // }),
    },
  }
);

export default ConnectionWorkerMachine;
