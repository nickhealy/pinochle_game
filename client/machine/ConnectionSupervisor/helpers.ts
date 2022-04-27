import { createIncomingAction } from "../ConnectionWorker/eventHelpers";
import { IncomingGameplayEvents } from "../gameplay/events";
import { GameEvents } from "../gameplay/types";

export const getWorkerId = (metadata: string) =>
  `connection_worker_${metadata}`;

export const createGameplayUpdate = (
  payloadType: string,
  srcPlayer: number | null = null,
  payloadData: any = {}
) => ({
  type: "GAMEPLAY_UPDATE",
  src_player: srcPlayer,
  payload: {
    type: payloadType,
    data: payloadData,
  },
});

export const createIncomingGameplayEvent = (event: GameEvents) => ({
  type: "INCOMING_GAME_EVENT" as const,
  event,
});

const getEventDomain = (event: IncomingGameplayEvents) => {
  // the enum type under the hood is typed this way in TS
  const _includes = (obj: { [s: number]: string }, field: string) =>
    Object.values(obj).includes(field);

  if (_includes(IncomingGameplayEvents, event)) {
    return "gameplay";
  }
};

const processIncomingAction = (
  e: ReturnType<typeof createIncomingAction>["payload"]
) => {
  switch (getEventDomain(e.event)) {
    case "gameplay":
      return createIncomingGameplayEvent({
        type: "BEGIN_GAME",
      });
    default:
      return null;
  }
};

export const parseSupervisorEvent = (
  e: ReturnType<typeof createIncomingAction>
) => {
  if (e.type === "INCOMING_ACTION") {
    return processIncomingAction(e.payload);
  }
};
