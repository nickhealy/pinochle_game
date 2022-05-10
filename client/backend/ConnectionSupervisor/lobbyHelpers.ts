import { ActorRef } from "xstate";
import { send } from "xstate/lib/actions";
import { ConnectionWorkerEvent } from "../ConnectionWorker/types";
import { createLobbyUpdate } from "./eventHelpers";
import {
  ConnectionSupervisorContext,
  ConnectionSupervisorEvents,
} from "./types";

const _getRandomIdx = () => Math.floor(Math.random() * 4);

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
