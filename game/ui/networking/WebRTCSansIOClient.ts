import { LobbyEvents as OutgoingLobbyEvents } from "../../backend/ConnectionSupervisor/events";
import { CardKeys, Suit } from "../../backend/gameplay/Deck";
import { IncomingGameplayEvents as OutgoingGameplayEvents } from "../../backend/gameplay/events";
import { Meld, MeldType } from "../../backend/gameplay/Meld";

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
const passBid = () => _createOutgoingMessage(OutgoingGameplayEvents.FOLD);
const chooseTrump = (trump: Suit) =>
  _createOutgoingMessage(OutgoingGameplayEvents.TRUMP_CHOSEN, { trump });
const submitMeld = (cards: Array<CardKeys>, type: MeldType) =>
  _createOutgoingMessage(OutgoingGameplayEvents.ADD_MELD, { cards, type });

export default {
  startGame,
  submitBid,
  passBid,
  chooseTrump,
  submitMeld,
};
