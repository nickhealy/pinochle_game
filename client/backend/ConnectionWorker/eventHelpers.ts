import { LobbyEvents } from "../ConnectionSupervisor/events";
import { IncomingGameplayEvents } from "../gameplay/events";

export const createIncomingAction = (
  connectionId: string,
  event: IncomingGameplayEvents | LobbyEvents,
  data: Record<string, any>
) => ({
  type: "INCOMING_ACTION" as const,
  connection_id: connectionId,
  payload: {
    event,
    data,
  },
});
