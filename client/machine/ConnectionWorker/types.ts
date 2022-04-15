export interface ConnectionWorkerContext {
  incoming_queue: {}[];
  outgoing_queue: {}[];
  last_heartbeat: string;
}

export type ConnectionWorkerEvent =
  | { type: "CONNECT"; metadata: string }
  | { type: "CONNECTED" }
  | { type: "HEARTBEAT_SUCCESS" }
  | { type: "HEARTBEAT_FAIL" }
  | { type: "PLAYER_ACTION" };
