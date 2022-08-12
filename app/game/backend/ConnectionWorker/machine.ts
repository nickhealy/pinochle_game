import { DataConnection } from "peerjs";
import { assign, createMachine, send } from "xstate";
import { sendParent } from "xstate/lib/actions";
import { getWebRTCClient } from "../networking/webrtc";
import { createIncomingAction } from "./eventHelpers";
import {
  ConnectionWorkerContext,
  ConnectionWorkerEvent,
  metadataExists,
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
      worker_key: undefined,
      connection_ref: null,
    },
    id: "ConnectionWorkerMachine",
    initial: "idle",
    states: {
      idle: {
        on: {
          CONNECT: {
            actions: "registerConnectionInfo",
            target: "connecting",
          },
        },
      },
      connecting: {
        invoke: {
          id: "getWebRTCClient",
          src: async (ctx) => await getWebRTCClient(ctx.connection_metadata),
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
            target: "connected",
          },
        },
      },
      connected: {
        entry: ["sendConnected", "saveConnectionRef"],
        invoke: {
          id: "rxtxLoop",
          src: (ctx) => (cb, onReceive) => {
            if (!ctx.connection_ref) {
              throw new Error("Connection does not exists"); // should not get here
            }

            ctx.connection_ref.on('data', (message) => {
              // TODO: validate the fields of the incoming request, try/catch around JSON.parse
              const parsedMessage = JSON.parse(message as string);
              
              console.log(
                `[connection-worker] received incoming message : ${message}`
              );
              if (!metadataExists(ctx.connection_metadata)) {
                throw new Error("Metadata does not exists"); // should not get here
              }
              cb(
                createIncomingAction(
                  ctx.connection_metadata,
                  parsedMessage.event,
                  parsedMessage.data
                )
              );
              // obviously, some sort of error handling here
            });

            onReceive((e) => {
              if (!ctx.connection_ref) {
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
          INCOMING_ACTION: {
            actions: "forwardToSupervisor",
          },
        },
      },
    },
  },
  {
    actions: {
      registerConnectionInfo: assign({
        connection_metadata: (_, evt) => evt.metadata,
        worker_key: (_, evt) => evt.worker_key,
      }),
      saveConnectionRef: assign({
        connection_ref: (_, evt) => evt.connection as DataConnection,
      }),
      sendSelfConnected: send((_, evt) => ({
        type: "CONNECTED",
        connection: evt.data,
      })),
      sendConnected: sendParent((ctx) => ({
        type: "PLAYER_CONNECTED",
        worker_key: ctx.worker_key,
      })),
      sendConnectionFail: sendParent((ctx) => ({
        type: "PLAYER_CONNECTION_FAIL",
        worker_key: ctx.worker_key,
      })),
      forwardGameplayEvent: send((_, evt) => evt, { to: "rxtxLoop" }),
      forwardToSupervisor: sendParent((_, evt) => evt),
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
