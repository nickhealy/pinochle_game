import { Peer } from "peerjs";
import TYPES from "../../inversify-types";
import main from "../../inversify.config";
import { StoreType } from "../store";

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
  constructor(name: string, isHost: boolean = false) {
    this.name = name;
    this.isHost = isHost;
    this.peer = new Peer();
    debugger;
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
}

// @ts-ignore
globalThis.host = new MockPlayer("nick", true);
// @ts-ignore
globalThis.annabelle = new MockPlayer("annabelle");
// @ts-ignore
globalThis.scott = new MockPlayer("scott");
// @ts-ignore
globalThis.chris = new MockPlayer("chris");

// @ts-ignore
globalThis.joinAllPlayers = () => {
  // @ts-ignore
  globalThis.annabelle.joinRoom();
  // @ts-ignore
  globalThis.scott.joinRoom();
  // @ts-ignore
  globalThis.chris.joinRoom();
  // @ts-ignore
};

// const mockConnection = new MockConnection();

// @ts-ignore
// globalThis.mockConnection = mockConnection;

// export default mockConnection as unknown as DataConnection;
