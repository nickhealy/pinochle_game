import { CardKeys } from "./Deck";

type GPPlayCardPayload = {
  name: "lobby.gameplay.play.play_card";
  player: number;
  card: CardKeys;
};

type PEPlayCardPayload = {
  name: "player.gameplay.play.play_card";
  player: number;
  card: CardKeys;
};

export type GamePlayUpdatePayload = GPPlayCardPayload;

export type PlayerEventPayload = PEPlayCardPayload;
