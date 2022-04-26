import { GameEvents } from "./gameplay/types";

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

export const createIncomingAction = (
  connectionId: string,
  actionId: string,
  payload: any
) => ({
  type: "INCOMING_ACTION" as const,
  connection_id: connectionId,
  action_id: actionId,
  payload,
});

export const createPlayerGameEvent = (event: GameEvents) => ({
  type: "PLAYER_GAME_EVENT" as const,
  event,
});

const processIncomingAction = (e: ReturnType<typeof createIncomingAction>) => {
  switch (e.action_id) {
    case "start_game":
      return createPlayerGameEvent({
        type: "BEGIN_GAME",
      });
    default:
      return null;
  }
};

export const processSupervisorAction = (
  e: ReturnType<typeof createIncomingAction>
) => {
  if (e.type === "INCOMING_ACTION") {
    return processIncomingAction(e);
  }
};
