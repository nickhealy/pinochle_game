import { LobbyEvents } from "../ConnectionSupervisor/events";
import { IncomingGameplayEvents } from "../gameplay/events";

export const createIncomingAction = (
  playerWorkerId: string,
  event: IncomingGameplayEvents | LobbyEvents,
  data: Record<string, any>
) => ({
  type: "INCOMING_ACTION" as const,
  payload: {
    event,
    data: {
      ...data,
      player: playerWorkerId,
    } as Record<string, any>,
  },
});
