import { ActorRef, Spawnable } from "xstate";
import {
  ConnectionWorkerContext,
  ConnectionWorkerEvent,
} from "../ConnectionWorker/types";
import { createGameplayUpdate } from "../gameplay/events";
import {
  GamePlayUpdatePayload,
  PlayerEventPayload,
} from "../gameplay/gamePlayEventTypes";
import { GameEvents } from "../gameplay/types";

export interface ConnectionSupervisorContext {
  connected_workers: Record<string, ActorRef<ConnectionWorkerEvent>>;
  pending_workers: Record<string, ActorRef<ConnectionWorkerEvent>>;
  player_info: Record<string, { name: string }>;
  workers_x_player_ids: Array<string>;
  gameplay_ref: ActorRef<GameEvents> | null;
}

export type ConnectionSupervisorEvents =
  | { type: "PLAYER_CONNECTED"; metadata: string }
  | { type: "PLAYER_CONNECTION_FAIL"; id: number }
  | ReturnType<typeof createGameplayUpdate>
  | {
      type: "INCOMING_ACTION";
      connection_info: string;
      payload: PlayerEventPayload;
    }
  | {
      type: "INCOMING_GAME_EVENT";
      event: GameEvents;
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
      connection_info: string; // obvi will be actual info
      name: string;
    }
  | {
      type: "START_GAME";
    };
