import { assign, createMachine, DoneInvokeEvent, send } from "xstate";
import { sendParent } from "xstate/lib/actions";
import Connection from "../networking/types";
import getWebRtcConnection from "../networking/webrtc";
import { createIncomingAction } from "./eventHelpers";
import {
  connectionExists,
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
            target: "connected",
          },
        },
      },
      connected: {
        entry: ["sendConnected", "saveConnectionRef"],
        invoke: {
          id: "rxtxLoop",
          src: (ctx) => (cb, onReceive) => {
            if (!connectionExists(ctx.connection_ref)) {
              throw new Error("Connection does not exists"); // should not get here
            }

            ctx.connection_ref.onmessage = (message) => {
              // TODO: validate the fields of the incoming request, try/catch around JSON.parse
              const parsedMessage = JSON.parse(message);
              if (!metadataExists(ctx.connection_metadata)) {
                throw new Error("Metadata does not exists"); // should not get here
              }
              cb(
                createIncomingAction(
                  ctx.connection_metadata,
                  parsedMessage.event,
                  parsedMessage.payload
                )
              );
              // obviously, some sort of error handling here
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
          INCOMING_ACTION: {
            actions: "forwardToSupervisor",
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