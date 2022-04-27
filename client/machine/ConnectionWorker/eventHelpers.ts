import { IncomingGameplayEvents } from "../gameplay/events";

export const createIncomingAction = (
  connectionId: string,
  event: IncomingGameplayEvents,
  data: Record<string, any>
) => ({
  type: "INCOMING_ACTION" as const,
  connection_id: connectionId,
  payload: {
    event,
    data,
  },
});
