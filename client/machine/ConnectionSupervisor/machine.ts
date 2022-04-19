import { assign, createMachine, spawn } from "xstate";
import { pure, send, sendTo } from "xstate/lib/actions";
import ConnectionWorkerMachine from "../ConnectionWorker/machine";
import { getWorkerId } from "./helpers";
import {
  ConnectionSupervisorContext,
  ConnectionSupervisorEvents,
} from "./types";

const ConnectionSupervisorMachine = createMachine(
  {
    preserveActionOrder: true,
    tsTypes: {} as import("./machine.typegen").Typegen0,
    schema: {
      context: {} as ConnectionSupervisorContext,
      events: {} as ConnectionSupervisorEvents,
    },
    context: {
      connected_workers: {},
      pending_workers: {},
      workers_x_player_ids: [null, null, null, null],
    },
    id: "ConnectionSupervisorMachine",
    initial: "waiting",
    states: {
      waiting: {
        on: {
          PLAYER_CONNECTED: [
            {
              target: "waiting_pseudostate",
              actions: ["upgradePendingWorker", "storeWorkerMetadata"],
              cond: "pendingWorkerExists",
            },
          ],
          PLAYER_CONNECTION_FAIL: {
            actions: "removePendingWorker",
          },
          PLAYER_JOIN_REQUEST: {
            actions: ["createPendingWorker", "connectPendingWorker"],
            cond: "roomNotFull",
          },
        },
      },
      waiting_pseudostate: {
        always: [
          {
            target: "ready",
            cond: "allPlayersConnected",
          },
          {
            target: "waiting",
          },
        ],
      },
      ready: {},
      active: {
        on: {
          GAME_PLAY_UPDATE: {
            actions: "handleGameplayUpdate",
          },
          PLAYER_EVENT: {
            actions: "handlePlayerEvent",
          },
          PLAYER_DISCONNECT: {
            target: "waiting",
            actions: "clearWorker",
          },
        },
      },
    },
    on: {
      FAILED_HEARTBEAT: {
        actions: "handleFailedHeartbeat",
      },
    },
  },
  {
    guards: {
      allPlayersConnected: (ctx, _) =>
        Object.keys(ctx.connected_workers).length === 3,
      pendingWorkerExists: (ctx, { metadata }) =>
        !!ctx.pending_workers[metadata],
      roomNotFull: (ctx, _) =>
        Object.keys(ctx.connected_workers).length +
          Object.keys(ctx.pending_workers).length <
        3,
    },
    actions: {
      handleGameplayUpdate: pure((ctx, evt) => {
        return Object.entries(ctx.connected_workers).map(
          ([metadata, worker]) => {
            if (ctx.workers_x_player_ids[evt.player] !== metadata) {
              return send(
                (_, _evt) => ({
                  type: "GAMEPLAY_UPDATE",
                  action_data: _evt.payload,
                }),
                { to: () => worker }
              );
            }
            return send("NO_OP"); // FIX-ME: see if you can send to only some workers in array
          }
        );
      }),
      handlePlayerEvent: () => {},
      handleFailedHeartbeat: () => {},
      createPendingWorker: assign({
        pending_workers: (ctx, evt) => ({
          ...ctx.pending_workers,
          [evt.metadata]: spawn(
            ConnectionWorkerMachine,
            getWorkerId(evt.metadata)
          ),
        }),
      }),
      connectPendingWorker: send(
        (_, evt) => ({ type: "CONNECT", metadata: evt.metadata }),
        {
          to: (_, evt) => getWorkerId(evt.metadata),
        }
      ),
      upgradePendingWorker: assign((ctx, evt) => {
        const { [evt.metadata]: connectedWorker, ...otherWorkers } =
          ctx.pending_workers;
        return {
          connected_workers: {
            ...ctx.connected_workers,
            [evt.metadata]: connectedWorker,
          },
          pending_workers: otherWorkers,
        };
      }),
      storeWorkerMetadata: assign((ctx, evt) => ({
        workers_x_player_ids: ctx.workers_x_player_ids.splice(
          ctx.workers_x_player_ids.indexOf(null),
          1,
          evt.metadata
        ),
      })),
      removePendingWorker: assign({
        pending_workers: (ctx, evt) => {
          delete ctx.pending_workers[evt.id];
          return ctx.pending_workers;
        },
      }),
      clearWorker: () => {
        // see https://githubhot.com/repo/davidkpiano/xstate/issues/2531
      },
    },
  }
);

export default ConnectionSupervisorMachine;
