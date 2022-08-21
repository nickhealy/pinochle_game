import { DataConnection } from "peerjs";
import { createIncomingAction } from "./eventHelpers";

export interface ConnectionWorkerContext {
  connection_metadata: string | undefined;
  worker_key: string | undefined;
  incoming_queue: {}[];
  outgoing_queue: {}[];
  last_heartbeat: string | undefined;
  connection_ref: null | DataConnection;
}

export type ConnectionWorkerEvent =
  | { type: "CONNECT"; metadata: string; worker_key: string }
  | { type: "CONNECTED"; connection: any } // obviously wont be any once we hook up webrtc code
  | { type: "HEARTBEAT_SUCCESS" }
  | { type: "HEARTBEAT_FAIL"; metadata: string }
  | { type: "GAMEPLAY_UPDATE"; payload: any }
  | ReturnType<typeof createIncomingAction>;

export const metadataExists = (
  metadata: undefined | string
): metadata is string => !!metadata && metadata !== "";
