export const createGameplayUpdate = (
  payloadType: string,
  srcPlayer: number | null = null,
  payloadData: any = {}
) => ({
  type: "GAMEPLAY_UPDATE",
  src_player: srcPlayer,
  payload: {
    type: payloadType,
    data: payloadData,
  },
});
