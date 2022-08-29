export enum PreGameEvents {
  JOIN_GAME = "join_game",
  JOIN_GAME_SUCCESS = "join_game_success",
  JOIN_GAME_FAIL = "join_game_fail",
}

export enum WebRTCEvents {
  OWN_PEER_OPENED = "own_peer_opened",
  OWN_PEER_CONNECTED = "own_peer_connected",
  HOST_PEER_OPENED = "host_peer_opened",
  HOST_PEER_CONNECTED = "host_peer_connected",
}

export type AllEvents = PreGameEvents | WebRTCEvents;
