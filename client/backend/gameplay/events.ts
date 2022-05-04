import { GameEvents } from "./types";

export const createGameplayUpdate = (
  payloadType: string,
  targets: number[] | null = null,
  payloadData: any = {}
) => ({
  type: "GAMEPLAY_UPDATE" as const,
  targets,
  payload: {
    type: payloadType,
    data: payloadData,
  },
});

export enum IncomingGameplayEvents {
  START_GAME = "gameplay.start_game",
  BID = "bid",
  FOLD = "bid_fold",
  TRUMP_CHOSEN = "choose_trump",
  MELD_SUBMITTED = "submit_meld",
  EDIT_MELD = "edit_meld",
  READY = "ready_start",
  REJECT = "rejec_startt",
  PLAY_CARD = "play_card",
}

export const processIncomingPlayerEvent = (
  e: ReturnType<typeof createGameplayUpdate>
): GameEvents | null => {
  const { type, data } = e.payload;
  switch (type) {
    case IncomingGameplayEvents.START_GAME:
      return { type: "START_GAME" };
    case IncomingGameplayEvents.BID:
      return { type: "BID", value: data.value };
    case IncomingGameplayEvents.FOLD:
      return { type: "FOLD", isHez: data.isHez };
    case IncomingGameplayEvents.TRUMP_CHOSEN:
      return { type: "TRUMP_CHOSEN", trump: data.trump };
    case IncomingGameplayEvents.MELD_SUBMITTED:
      return {
        type: "SUBMIT_MELDS",
        melds: data.melds,
        player: data.player,
      };
    case IncomingGameplayEvents.EDIT_MELD:
      return { type: "EDIT_MELD", player: data.player };
    case IncomingGameplayEvents.READY:
      return { type: "PLAYER_READY" };
    case IncomingGameplayEvents.REJECT:
      return { type: "PLAYER_REJECT", player: data.player };
    case IncomingGameplayEvents.PLAY_CARD:
      return {
        type: "PLAY_CARD",
        key: data.key,
        player: data.player,
      };
    default:
      return null;
  }
};
