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
  ADD_MELD = "gameplay.pre_play.player_add_meld",
  COMMIT_MELDS = "gameplay.pre_play.player_commit_melds",
  PLAY_CARD = "gameplay.play.player_play_card",
}
