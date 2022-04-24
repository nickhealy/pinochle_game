import { assign, createMachine, spawn } from "xstate";
import { pure, send, sendTo } from "xstate/lib/actions";
import ConnectionWorkerMachine from "../ConnectionWorker/machine";
import GameMachine from "../gameplay/machine";
import { createGameplayUpdate } from "../helpers";
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
      player_info: {},
      workers_x_player_ids: [null, null, null, null],
      gameplay_ref: null,
    },
    id: "ConnectionSupervisorMachine",
    initial: "waiting",
    entry: assign({
      gameplay_ref: () => spawn(GameMachine, "gameplay_machine"),
    }),
    states: {
      waiting: {
        on: {
          PLAYER_CONNECTED: [
            {
              target: "waiting_pseudostate",
              actions: [
                "upgradePendingWorker",
                "storeWorkerMetadata",
                "announceNewPlayer",
                "sendRoomDescription",
              ],
              cond: "pendingWorkerExists",
            },
          ],
          PLAYER_CONNECTION_FAIL: {
            actions: "removePendingWorker",
          },
          PLAYER_JOIN_REQUEST: {
            actions: [
              "createPendingWorker",
              "savePlayerInfo",
              "connectPendingWorker",
            ],
            cond: "roomNotFull",
          },
        },
      },
      waiting_pseudostate: {
        always: [
          {
            target: "active",
            cond: "allPlayersConnected",
          },
          {
            target: "waiting",
          },
        ],
      },
      active: {
        on: {
          GAMEPLAY_UPDATE: {
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
        Object.keys(ctx.connected_workers).length === 4,
      pendingWorkerExists: (ctx, { metadata }) =>
        !!ctx.pending_workers[metadata],
      roomNotFull: (ctx, _) =>
        Object.keys(ctx.connected_workers).length +
          Object.keys(ctx.pending_workers).length <
        4,
    },
    actions: {
      handleGameplayUpdate: pure((ctx, evt) => {
        return Object.entries(ctx.connected_workers)
          .filter(
            ([metadata, _]) =>
              // if no source player is specified, we can send to all players
              !evt.player || ctx.workers_x_player_ids[evt.player] !== metadata
          )
          .map(([_, worker]) =>
            send(
              (_, _evt) => ({
                type: "GAMEPLAY_UPDATE",
                payload: _evt.payload,
              }),
              { to: () => worker }
            )
          );
      }),
      announceNewPlayer: pure((ctx, evt) => {
        return Object.entries(ctx.connected_workers)
          .filter(([metadata, _]) => evt.metadata !== metadata)
          .map(([_, worker]) =>
            send(
              (ctx, _evt) =>
                createGameplayUpdate("lobby.player_join", null, {
                  player_info: {
                    name: ctx.player_info[_evt.metadata].name,
                    // ... plus avatar, etc.
                  },
                }),
              { to: () => worker }
            )
          );
      }),
      sendRoomDescription: send(
        (ctx) =>
          createGameplayUpdate("lobby.room_description", null, {
            players: Object.keys(ctx.connected_workers).map((wkr) => ({
              name: ctx.player_info[wkr].name,
            })),
          }),
        {
          to: (ctx, evt) => ctx.connected_workers[evt.metadata],
        }
      ),
      handlePlayerEvent: send(
        (_, evt) => ({
          type: "PLAYER_EVENT",
          payload: evt.payload,
        }),
        { to: "gameplay_machine" }
      ),
      handleFailedHeartbeat: () => {},
      createPendingWorker: assign({
        pending_workers: (ctx, evt) => ({
          ...ctx.pending_workers,
          [evt.connection_info]: spawn(
            ConnectionWorkerMachine,
            getWorkerId(evt.connection_info)
          ),
        }),
      }),
      savePlayerInfo: assign({
        player_info: (ctx, evt) => ({
          ...ctx.player_info,
          [evt.connection_info]: {
            name: evt.name,
          },
        }),
      }),
      connectPendingWorker: send(
        (_, evt) => ({ type: "CONNECT", metadata: evt.connection_info }),
        {
          to: (_, evt) => getWorkerId(evt.connection_info),
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
      // announceNewPlayer:
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
