import { Spawnable } from "xstate";
import {
  GamePlayUpdatePayload,
  PlayerEventPayload,
} from "../gameplay/gamePlayEventTypes";

export interface ConnectionSupervisorContext {
  connected_workers: Spawnable[];
  pending_workers: Spawnable[];
  workers_x_player_ids: number[];
}

export type ConnectionSupervisorEvents =
  | { type: "PLAYER_CONNECTED"; id: number }
  | { type: "PLAYER_CONNECTION_FAIL"; id: number }
  | {
      type: "GAME_PLAY_UPDATE";
      player: number;
      payload: GamePlayUpdatePayload;
    }
  | {
      type: "PLAYER_EVENT";
      player: number;
      payload: PlayerEventPayload;
    }
  | {
      type: "FAILED_HEARTBEAT";
      player: number;
    }
  | {
      type: "PLAYER_DISCONNECT";
      player: number;
    }
  | {
      type: "PLAYER_JOIN_REQUEST";
      info: string; // obvi will be actual info
    };
