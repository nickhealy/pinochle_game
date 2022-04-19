import Connection from "../networking/types";

export interface ConnectionWorkerContext {
  connection_metadata: string | undefined;
  incoming_queue: {}[];
  outgoing_queue: {}[];
  last_heartbeat: string | undefined;
  connection_ref: null | Connection;
}

export type ConnectionWorkerEvent =
  | { type: "CONNECT"; metadata: string }
  | { type: "CONNECTED" }
  | { type: "HEARTBEAT_SUCCESS" }
  | { type: "HEARTBEAT_FAIL" }
  | { type: "GAMEPLAY_UPDATE"; action_data: string }
  | { type: "NO_OP" };
