import { ActorRef } from "xstate";
import { send } from "xstate/lib/actions";
import { createIncomingAction } from "../ConnectionWorker/eventHelpers";
import { ConnectionWorkerEvent } from "../ConnectionWorker/types";
import { createGameplayUpdate } from "../gameplay/events";
import { GameEvents } from "../gameplay/types";
import { createIncomingGameplayEvent, createLobbyUpdate } from "./eventHelpers";
import {
  ConnectionSupervisorContext,
  ConnectionSupervisorEvents,
} from "./types";

let idx = 0;
const _getRandomIdx = () => {
  //@ts-ignore
  if (!globalThis._useMocks) {
    return Math.floor(Math.random() * 4);
  }

  return idx++;
};

export const shuffleConnectedWorkerKeys = (connectedWorkers: Array<string>) => {
  const shuffledWorkers: Array<string | null> = [null, null, null, null];
  for (const worker of connectedWorkers) {
    let nextIdx = _getRandomIdx(); // we want number between 0 and 3
    while (shuffledWorkers[nextIdx] !== null) {
      nextIdx = _getRandomIdx();
    }
    shuffledWorkers[nextIdx] = worker;
  }

  return shuffledWorkers as Array<string>;
};

export const sendToPlayers = (
  playerIds: Array<ActorRef<ConnectionWorkerEvent>>,
  messageId: string,
  payloadData: Record<string, any> = {}
) =>
  playerIds.map((player) =>
    send<
      ConnectionSupervisorContext,
      ConnectionSupervisorEvents | { type: "" }
    >(createLobbyUpdate(messageId, null, payloadData), { to: () => player })
  );

export const addPlayerIds = (
  action: ReturnType<typeof createGameplayUpdate>,
  lobbyCtx: ConnectionSupervisorContext
): ReturnType<typeof createGameplayUpdate> => {
  const playerIdx: number | null =
    "player" in action.payload.data ? action.payload.data.player : null;
  return {
    ...action,
    payload: {
      ...action.payload,
      data: {
        ...action.payload.data,
        ...((playerIdx !== null && {
          player: lobbyCtx.workers_x_player_ids[playerIdx],
        }) ||
          {}),
      },
    },
  };
};

export const removePlayerIds = (
  action: GameEvents,
  lobbyCtx: ConnectionSupervisorContext
): GameEvents => {
  if ("player" in action) {
    return {
      ...action,
      // @ts-expect-error this will actually be a string at runtime
      player: lobbyCtx.workers_x_player_ids.indexOf(action.player),
    };
  }
  return action;
};
