import { DataConnection, Peer } from "peerjs";
import Connection from "./types";

class WebRTCClient implements Connection {
  _peer: Peer;
  _connection: DataConnection | null = null;
  isHost: boolean;
  hostId: string | null = null;
  constructor(isHost: boolean) {
    this._peer = new Peer(isHost ? "host" : "test-" + Math.random());
    this.isHost = isHost;
    this._peer.on("open", (id) => {
      console.log("id found : ", id);
    });
  }
  get id() {
    return this._peer.id;
  }
  connectToPeer(remoteId: string) {
    this._connection = this._peer.connect(remoteId);
  }
  send(data: string): void {
    if (!this._connection) {
      console.error("Peer must connect to host before sending messages");
      return;
    }
    this._connection.send(data);
  }
  onmessage(data: string): void {}
  registerMachine() {}
  registerMessageHandlers() {}
}

export function getWebRTCClient(metadata: string | undefined) {
  debugger
  let conn: DataConnection;
  return new Promise((res, rej) => {
    // @ts-expect-error
    conn = (window._host_peer as Peer).connect(metadata);
    conn.on("open", () => {
      console.log(`connection to ${metadata} has been opened`);
      res(conn);
    });
  });
}

let localPeer: Peer;

export default WebRTCClient;
