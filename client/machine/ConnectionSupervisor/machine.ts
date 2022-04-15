import { assign, createMachine, spawn } from "xstate";
import ConnectionWorkerMachine from "../ConnectionWorker/machine";
import {
  ConnectionSupervisorContext,
  ConnectionSupervisorEvents,
} from "./types";

// const spawnWorkers = () => {
//   const workers = [];
//   for (let i = 0; i < 4; i++) {
//     workers.push(spawn(ConnectionWorkerMachine, `connection_worker_${i}`));
//   }
//   return workers;
// };

// need to figure out how to keep track of these workers
// look up spawning workers on init in xstate

// how does killing the game if a player terminates connection make this easier?

// after a connection is terminated, the player has 15 seconds to rejoin before terminating the game

// could also be a dictionary
/**
 * {
 *  '0' : worker,
 *  '1' : worker,
 *  '2' : worker,
 *  '3' : worker
 * }
 */

/**
 * there is particular event that worker sends to supervisor that it has connected (entered the room)
 */

const ConnectionSupervisorMachine = createMachine(
  {
    preserveActionOrder: true,
    tsTypes: {} as import("./machine.typegen").Typegen0,
    schema: {
      context: {} as ConnectionSupervisorContext,
      events: {} as ConnectionSupervisorEvents,
    },
    context: {
      connected_workers: [],
      pending_workers: [],
      workers_x_player_ids: [],
    },
    id: "ConnectionSupervisorMachine",
    initial: "waiting",
    states: {
      waiting: {
        on: {
          PLAYER_CONNECTED: {
            target: "waiting_pseudostate",
            actions: "upgradePendingWorker",
          },
          PLAYER_CONNECTION_FAIL: {
            actions: "removePendingWorker",
          },
          PLAYER_JOIN_REQUEST: {
            actions: "createPendingWorker",
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
      allPlayersConnected: (ctx, _) => true,
      roomNotFull: (ctx, _) =>
        ctx.connected_workers.length + ctx.pending_workers.length < 4,
    },
    actions: {
      handleGameplayUpdate: () => {},
      handlePlayerEvent: () => {},
      handleFailedHeartbeat: () => {},
      createPendingWorker: assign({
        pending_workers: (ctx, _) => [
          ...ctx.pending_workers,
          spawn(
            ConnectionWorkerMachine,
            `connection_worker_${ctx.pending_workers.length}`
          ),
        ],
      }),
      upgradePendingWorker: assign((ctx, evt) => {
        const { id } = evt;
        const connectedWorker = ctx.pending_workers[id];
        return {
          connected_workers: [...ctx.connected_workers, connectedWorker],
          pending_workers: ctx.pending_workers.filter((_, idx) => idx !== id),
        };
      }),
      removePendingWorker: assign({
        pending_workers: (ctx, evt) =>
          ctx.pending_workers.filter((_, idx) => idx !== evt.id),
      }),
      clearWorker: () => {},
    },
  }
);

export default ConnectionSupervisorMachine;
