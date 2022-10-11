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
const addMeld = (cards: Array<CardKeys>, type: MeldType) =>
  _createOutgoingMessage(OutgoingGameplayEvents.ADD_MELD, {
    meld: { type, cards },
  });
const submitMelds = () =>
  _createOutgoingMessage(OutgoingGameplayEvents.COMMIT_MELDS);
const startPlay = () =>
  _createOutgoingMessage(OutgoingGameplayEvents.START_PLAY);
const playCard = (card: CardKeys) =>
  _createOutgoingMessage(OutgoingGameplayEvents.PLAY_CARD, { card });

export default {
  startGame,
  submitBid,
  passBid,
  chooseTrump,
  addMeld,
  submitMelds,
  startPlay,
  playCard,
};
