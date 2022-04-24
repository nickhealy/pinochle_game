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
  | { type: "CONNECTED"; connection: any } // obviously wont be any once we hook up webrtc code
  | { type: "HEARTBEAT_SUCCESS" }
  | { type: "HEARTBEAT_FAIL"; metadata: string }
  | { type: "GAMEPLAY_UPDATE"; payload: any }
  | { type: "PLAYER_ACTION"; payload: string };

export const connectionExists = (ref: null | Connection): ref is Connection =>
  !!ref?.send && !!ref.onmessage;
