import { ActorRef } from "xstate";
import { ConnectionWorkerEvent } from "../ConnectionWorker/types";

const _getRandomIdx = () => Math.floor(Math.random() * 4);

export const shuffleConnectedWorkers = (
  connectedWorkers: Array<ActorRef<ConnectionWorkerEvent>>
) => {
  const shuffledWorkers: Array<ActorRef<ConnectionWorkerEvent> | null> = [
    null,
    null,
    null,
    null,
  ];
  for (const worker of connectedWorkers) {
    let nextIdx = _getRandomIdx(); // we want number between 0 and 3
    while (shuffledWorkers[nextIdx] !== null) {
      nextIdx = _getRandomIdx();
    }
    shuffledWorkers[nextIdx] = worker;
  }

  return shuffledWorkers;
};
