export interface ConnectionWorkerContext {
  connection_metadata: string | undefined;
  incoming_queue: {}[];
  outgoing_queue: {}[];
  last_heartbeat: string | undefined;
}

export type ConnectionWorkerEvent =
  | { type: "CONNECT"; metadata: string }
  | { type: "CONNECTED" }
  | { type: "HEARTBEAT_SUCCESS" }
  | { type: "HEARTBEAT_FAIL" }
  | { type: "PLAYER_ACTION" };
