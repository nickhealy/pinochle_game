export enum PreGameEvents {
  GO_TO_JOIN_GAME = "go_to_join_game",
  GO_TO_NEW_GAME = "go_to_new_game",
  GO_BACK = "go_back",
  JOIN_GAME = "join_game",
  JOIN_GAME_SUCCESS = "join_game_success",
  JOIN_GAME_FAIL = "join_game_fail",
  CREATE_GAME = "create_game",
  CREATE_GAME_SUCCESS = "create_game_success",
  CREATE_GAME_FAIL = "create_game_fail",
}

export enum WebRTCEvents {
  OWN_PEER_OPENED = "own_peer_opened",
  OWN_PEER_CONNECTED = "own_peer_connected",
  HOST_PEER_OPENED = "host_peer_opened",
  HOST_PEER_CONNECTED = "host_peer_connected",
}

export enum LobbyEvents {
  SELF_JOINED_LOBBY = "self_joined_lobby",
  PLAYER_JOINED_LOBBY = "player_joined_lobby",
  ALL_PLAYERS_CONNECTED = "all_players_connected",
  START_GAME = "start_game",
  GAME_START = "game_start",
  ROUND_START = "round_start",
  TEAMS_RECEIVED = "teams_received",
}

export enum GameplayEvents {
  OWN_CARDS_RECEIVED = "own_cards_received",
  AWAITING_BID = "awaiting_bid",
  PLAYER_BID = "player_bid",
  PASS_BID = "pass_bid",
  BID_WINNER = "bid_winner",
  TRUMP_CHOOSING = "trump_choosing",
  TRUMP_CHOSEN = "trump_chosen",
  AWAITING_MELDS = "awaiting_melds",
  ADD_MELD = "add_meld",
  SUBMIT_MELDS = "submit_melds",
}

export type AllEvents =
  | PreGameEvents
  | WebRTCEvents
  | LobbyEvents
  | GameplayEvents;
