import { createIncomingAction } from "../ConnectionWorker/eventHelpers";
import { IncomingGameplayEvents } from "../gameplay/events";
import { GameEvents } from "../gameplay/types";
import { LobbyEvents } from "./events";
import { ConnectionSupervisorEvents } from "./types";

export const getWorkerId = (metadata: string) =>
  `connection_worker_${metadata}`;

// temporary until i decide if i want to extract
// lobby stuff into its own machine (probably should)
export const createLobbyUpdate = (
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

const getEventDomain = (event: IncomingGameplayEvents | LobbyEvents) => {
  // the enum type under the hood is typed this way in TS
  const _includes = (obj: { [s: number]: string }, field: string) =>
    Object.values(obj).includes(field);

  if (_includes(LobbyEvents, event)) {
    return "lobby";
  }

  if (_includes(IncomingGameplayEvents, event)) {
    return "gameplay";
  }
};

const processIncomingGameEvent = (
  e: ReturnType<typeof createIncomingAction>["payload"]
) => {
  switch (e.event) {
    case IncomingGameplayEvents.START_GAME:
      return createIncomingGameplayEvent({
        type: "START_GAME",
      });
    case IncomingGameplayEvents.BID:
      return createIncomingGameplayEvent({
        type: "BID",
        value: e.data.value, // to do: maybe get some better typing here
      });
    case IncomingGameplayEvents.FOLD:
      return createIncomingGameplayEvent({
        type: "FOLD",
        isHez: false, // we can add support for this later
      });
    case IncomingGameplayEvents.TRUMP_CHOSEN:
      return createIncomingGameplayEvent({
        type: "TRUMP_CHOSEN",
        trump: e.data.trump,
      });
    case IncomingGameplayEvents.ADD_MELD:
      return createIncomingGameplayEvent({
        type: "ADD_MELD",
        meld: e.data.meld,
        player: e.data.player,
      });
    case IncomingGameplayEvents.COMMIT_MELDS:
      return createIncomingGameplayEvent({
        type: "COMMIT_MELDS",
        player: e.data.player,
      });
    case IncomingGameplayEvents.START_PLAY:
      return createIncomingGameplayEvent({ type: "START_PLAY" });
    case IncomingGameplayEvents.PLAY_CARD:
      return createIncomingGameplayEvent({
        type: "PLAY_CARD",
        key: e.data.card,
        player: e.data.player,
      });
    default:
      console.log("incoming game event type not recognized : ", e.event);
      return null;
  }
};

const processIncomingLobbyEvent = (
  e: ReturnType<typeof createIncomingAction>["payload"]
): ConnectionSupervisorEvents | null => {
  switch (e.event) {
    case LobbyEvents.START_GAME:
      return { type: "START_GAME" };
    default:
      return null;
  }
};

const processIncomingAction = (
  e: ReturnType<typeof createIncomingAction>["payload"]
) => {
  switch (getEventDomain(e.event)) {
    case "gameplay":
      return processIncomingGameEvent(e);
    case "lobby":
      return processIncomingLobbyEvent(e);
    default:
      console.log("not gameplay nor lobby");
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
