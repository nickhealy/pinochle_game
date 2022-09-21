import { DataConnection, Peer } from "peerjs";
import { CardKeys } from "../../backend/gameplay/Deck";
import TYPES from "../../inversify-types";
import main from "../../inversify.config";
import { StoreType } from "../store";
import WebRTCSansIOClient from "./WebRTCSansIOClient";

// @ts-ignore
globalThis._useMocks = false;
//@ts-ignore
globalThis.useMocks = (val = true) => {
  //@ts-ignore
  globalThis._useMocks = val;
};

// utility for developing without having to open multiple clients
abstract class MockConnection {
  _listeners: Record<string, Array<(data: string) => void>> = {};
  on(event: string, cb: (data: string) => void) {
    if (!this._listeners[event]) {
      this._listeners[event] = [];
    }
    this._listeners[event].push(cb);
  }

  emit(event: string, eventData: string) {
    const cbs = this._listeners[event];
    if (cbs) {
      cbs.forEach((cb) => cb(eventData));
    }
  }
}

class MockEventSource extends MockConnection {
  get readyState() {
    return EventSource.OPEN;
  }
  get OPEN() {
    return EventSource.OPEN;
  }
  onmessage(e: { data: string }) {
    // noop
    console.log("on message in mock");
  }
}

export const mockEV = new MockEventSource();

class MockPlayer {
  isHost: boolean;
  name: string;
  peer: Peer;
  conn: DataConnection | null = null;
  constructor(name: string, isHost: boolean = false) {
    this.name = name;
    this.isHost = isHost;
    this.peer = new Peer();
    this.waitForConnection();
  }
  joinRoom() {
    console.log("mock player ", this.name, " joining room");
    mockEV.onmessage({
      data: JSON.stringify({
        event: "player_join_request",
        peer_id: this.isHost
          ? main.get<StoreType>(TYPES.Store).get("peerId")
          : this.peer.id, // ew ew ew
        name: this.name,
      }),
    });
  }

  initializeListeners() {
    if (!this.conn) {
      console.error("NO connection, try again in a second");
      return;
    }
  }

  waitForConnection() {
    this.peer.on("connection", (conn) => {
      console.log(`${this.name} ready to play mock game`);
      this.conn = conn;
    });
  }

  bid(value: number) {
    console.log(this);
    console.log("sending -- ", this.conn);
    this.conn?.send(JSON.stringify(WebRTCSansIOClient.submitBid(value)));
  }
}

// @ts-ignore
globalThis.host = new MockPlayer("nick", true);
// @ts-ignore
globalThis.annabelle = new MockPlayer("annabelle");
// @ts-ignore
globalThis.chris = new MockPlayer("chris");
// @ts-ignore
globalThis.scott = new MockPlayer("scott");

// @ts-ignore
globalThis.joinAllPlayers = () => {
  // HACK ALERT -- THERE IS SOME SORT OF RACE CONDITION IN THE BE
  // THAT GETS TRIGGERED WHEN PEOPLE TRY TO JOIN IN THE SAME EVENT LOOP

  // @ts-ignore
  setTimeout(globalThis.scott.joinRoom.bind(globalThis.scott), 0);
  // @ts-ignore
  setTimeout(globalThis.annabelle.joinRoom.bind(globalThis.annabelle), 500);
  // @ts-ignore
  setTimeout(globalThis.chris.joinRoom.bind(globalThis.chris), 1000);
};

// const mockConnection = new MockConnection();

// @ts-ignore
// globalThis.mockConnection = mockConnection;

// export default mockConnection as unknown as DataConnection;
