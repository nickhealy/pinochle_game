import { Spawnable } from "xstate";
import {
  GamePlayUpdatePayload,
  PlayerEventPayload,
} from "../gameplay/gamePlayEventTypes";

export interface ConnectionSupervisorContext {
  connected_workers: Record<string, Spawnable>;
  pending_workers: Record<string, Spawnable>;
  workers_x_player_ids: number[];
}

export type ConnectionSupervisorEvents =
  | { type: "PLAYER_CONNECTED"; metadata: string }
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
      metadata: string; // obvi will be actual info
    };
