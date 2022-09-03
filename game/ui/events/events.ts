export enum PreGameEvents {
  GO_TO_JOIN_GAME = "go_to_join_game",
  GO_TO_NEW_GAME = "go_to_new_game",
  GO_BACK = "go_back",
  JOIN_GAME = "join_game",
  JOIN_GAME_SUCCESS = "join_game_success",
  JOIN_GAME_FAIL = "join_game_fail",
  CREATE_GAME = "create_game",
  CREATE_GAME_SUCESS = "create_game_success",
  CREATE_GAME_FAIL = "create_game_fail",
}

export enum WebRTCEvents {
  OWN_PEER_OPENED = "own_peer_opened",
  OWN_PEER_CONNECTED = "own_peer_connected",
  HOST_PEER_OPENED = "host_peer_opened",
  HOST_PEER_CONNECTED = "host_peer_connected",
}

export type AllEvents = PreGameEvents | WebRTCEvents;
