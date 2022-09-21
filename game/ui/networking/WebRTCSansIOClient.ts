import { LobbyEvents as OutgoingLobbyEvents } from "../../backend/ConnectionSupervisor/events";
import { IncomingGameplayEvents as OutgoingGameplayEvents } from "../../backend/gameplay/events";

const _createOutgoingMessage = (
  event: OutgoingLobbyEvents | OutgoingGameplayEvents,
  data: Record<string, any> = {}
) => ({
  event,
  data,
});

const startGame = () => _createOutgoingMessage(OutgoingLobbyEvents.START_GAME);
const submitBid = (value: number) =>
  _createOutgoingMessage(OutgoingGameplayEvents.BID, { value });

export default {
  startGame,
  submitBid,
};
