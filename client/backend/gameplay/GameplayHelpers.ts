import { Sender } from "xstate";
import Deck, { Card, CardKeys, Suit } from "./Deck";
import { GameEvents, Play } from "./types";

const LAST_TRICK_POINTS = 10;
export const getPlayerTeam = (playerId: number) => playerId % 2;

// sort plays highest to lowest (so highest is at front of array)
const sortCardsHighLow = ({ key: lkey }: Play, { key: rkey }: Play) =>
  Deck.getCardFromKey(rkey).value - Deck.getCardFromKey(lkey).value;

const sortPlaysOfSuit = (plays: Play[], suit: Suit) =>
  plays
    .filter(({ key }) => Deck.getCardFromKey(key).isSuit(suit))
    .sort(sortCardsHighLow);

export const getWinningPlay = (plays: Play[], trump: Suit) => {
  const ledSuit = Deck.getCardFromKey(plays[0].key).suit; // first card played determines the suit of the trick
  const ledSuitPlays = sortPlaysOfSuit(plays, ledSuit);
  const trumpSuitPlays = sortPlaysOfSuit(plays, trump);

  return trumpSuitPlays.length ? trumpSuitPlays[0] : ledSuitPlays[0];
};

export const getPlayPoints = (hands: Play[], isLastTrick: boolean = false) =>
  hands.reduce((tally, { key }) => tally + Deck.getCardFromKey(key).points, 0) +
  ((isLastTrick && LAST_TRICK_POINTS) || 0); // 10 extra points for last trick

export const getIsLastTrick = (playerHands: CardKeys[][]) =>
  playerHands.every((hand) => hand.length === 0);

export const getNextPlayer = (currPlayer: number) => (currPlayer + 1) % 4;

export const processIncomingGameEvent = (e: any, send: Sender<GameEvents>) => {
  // FIX ME -- lets add typings for this event object
  if (e.type !== "PLAYER_EVENT") {
    console.error("Game machine received invalid event : ", e);
    return;
  }
  const { name, payload } = e;
  switch (name) {
  }
};
