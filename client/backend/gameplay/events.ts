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
  BID = "gameplay.bid.player_bid",
  FOLD = "gameplay.bid.player_fold",
  TRUMP_CHOSEN = "gameplay.pre_play.trump_chosen",
  MELD_SUBMITTED = "gameplay.pre_play.submit_meld",
  EDIT_MELD = "edit_meld",
  READY = "ready_start",
  REJECT = "rejec_startt",
  PLAY_CARD = "play_card",
}
