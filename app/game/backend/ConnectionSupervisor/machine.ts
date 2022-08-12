import { assign, createMachine, spawn } from "xstate";
import { pure, send } from "xstate/lib/actions";
import ConnectionWorkerMachine from "../ConnectionWorker/machine";
import GameMachine from "../gameplay/machine";
import { createLobbyUpdate, parseSupervisorEvent } from "./eventHelpers";
import { getWorkerId } from "./eventHelpers";
import { addPlayerIds, removePlayerIds, sendToPlayers, shuffleConnectedWorkerKeys } from "./lobbyHelpers";
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
      workers_x_player_ids: [],
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
            actions: ["createPendingWorker", "connectPendingWorker"],
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
        entry: "sendPlayersConnected",
        invoke: {
          id: "connection_supervisor_listener",
          src: () => (cb, onReceive) => {
            onReceive((e) => {
              const parsedEvent = parseSupervisorEvent(e);
              if (!parsedEvent) {
                console.error("Unrecognized supervisor event : ", e);
                return;
              }
              cb(parsedEvent);
            });
          },
        },
        on: {
          GAMEPLAY_UPDATE: {
            actions: "forwardGameplayUpdate",
          },
          INCOMING_ACTION: {
            actions: "forwardToListener",
          },
          INCOMING_GAME_EVENT: {
            actions: "forwardToGameplayMachine",
          },
          PLAYER_DISCONNECT: {
            target: "waiting",
            actions: "clearWorker",
          },
          START_GAME: {
            actions: ["createTeams", "sendTeams", "sendStartToGameplayMachine"],
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
      pendingWorkerExists: (ctx, { worker_key }) =>
        !!ctx.pending_workers[worker_key],
      roomNotFull: (ctx, _) =>
        Object.keys(ctx.connected_workers).length +
          Object.keys(ctx.pending_workers).length <
        4,
    },
    actions: {
      forwardToListener: send((_, evt) => evt, {
        to: "connection_supervisor_listener",
      }),
      forwardGameplayUpdate: pure((ctx, evt) => {
        // sends event to each worker explicitly listed or, if none listed, to all players
        const targetWorkers = evt.targets
          ? evt.targets.map(
              (target) =>
                ctx.connected_workers[ctx.workers_x_player_ids[target]]
            )
          : Object.values(ctx.connected_workers);
        return targetWorkers.map((wkr) => send(addPlayerIds(evt, ctx), { to: () => wkr }));
      }),
      announceNewPlayer: pure((ctx, evt) => {
        const workerKey = evt.worker_key;
        return Object.entries(ctx.connected_workers)
          .filter(([key, _]) => workerKey !== key)
          .map(([_, worker]) =>
            send(
              (ctx) =>
                createLobbyUpdate("lobby.player_join", null, {
                  player_info: {
                    name: ctx.player_info[workerKey].name,
                    id: workerKey,
                    // ... plus avatar, etc.
                  },
                }),
              { to: () => worker }
            )
          );
      }),
      sendRoomDescription: send(
        (ctx, evt) =>
          createLobbyUpdate("lobby.room_description", null, {
            players: Object.keys(ctx.connected_workers).map((wkr) => ({
              name: ctx.player_info[wkr].name,
              id: wkr,
            })),
            own_id: evt.worker_key,
          }),
        {
          to: (ctx, evt) => ctx.connected_workers[evt.worker_key],
        }
      ),
      handleFailedHeartbeat: () => {},
      createPendingWorker: assign((ctx, evt) => {
        const encodedId = window.btoa(evt.connection_info);
        return {
          // create the worker
          pending_workers: {
            ...ctx.pending_workers,
            [encodedId]: spawn(
              ConnectionWorkerMachine,
              getWorkerId(evt.connection_info)
            ),
          },
          // store player info
          player_info: {
            ...ctx.player_info,
            [encodedId]: {
              connection_info: evt.connection_info,
              name: evt.name,
            },
          },
        };
      }),
      connectPendingWorker: send(
        (_, evt) => ({
          type: "CONNECT",
          metadata: evt.connection_info,
          worker_key: window.btoa(evt.connection_info), // duplicated here, but we don't have reference to this from here
        }),
        {
          to: (_, evt) => getWorkerId(evt.connection_info),
        }
      ),
      upgradePendingWorker: assign((ctx, evt) => {
        const workerKey = evt.worker_key;
        const { [workerKey]: connectedWorker, ...otherWorkers } =
          ctx.pending_workers;
        return {
          connected_workers: {
            ...ctx.connected_workers,
            [workerKey]: connectedWorker,
          },
          pending_workers: otherWorkers,
        };
      }),
      removePendingWorker: assign({
        pending_workers: (ctx, evt) => {
          delete ctx.pending_workers[evt.id];
          return ctx.pending_workers;
        },
      }),
      sendPlayersConnected: pure((ctx) =>
        Object.values(ctx.connected_workers).map((worker) =>
          send(createLobbyUpdate("lobby.all_players_connected", null), {
            to: () => worker,
          })
        )
      ),
      clearWorker: () => {
        // see https://githubhot.com/repo/davidkpiano/xstate/issues/2531
      },
      forwardToGameplayMachine: send((ctx, evt) => removePlayerIds(evt.event, ctx), {
        to: "gameplay_machine",
      }),
      createTeams: assign((ctx) => {
        const connectedWorkers = Object.keys(ctx.connected_workers);
        return {
          workers_x_player_ids: shuffleConnectedWorkerKeys(connectedWorkers),
        };
      }),
      sendTeams: pure((ctx) => {
        return Object.values(ctx.connected_workers).map((worker) =>
          send(
            createLobbyUpdate("lobby.player_teams", null, {
              teams: [
                [ctx.workers_x_player_ids[0], ctx.workers_x_player_ids[2]],
                [ctx.workers_x_player_ids[1], ctx.workers_x_player_ids[3]],
              ],
            }),
            {
              to: () => worker,
            }
          )
        );
      }),
      sendStartToGameplayMachine: send(
        { type: "START_GAME" },
        { to: "gameplay_machine" }
      ),
    },
  }
);

export default ConnectionSupervisorMachine;
