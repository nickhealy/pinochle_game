import { inject, injectable } from "inversify";
import Peer from "peerjs";
import EventEmitter from "../events/EventEmitter";
import { WebRTCEvents } from "../events/events";
import TYPES from "../types/main";

enum WebRTCManagerStates {
  INITIAL = "initial",
  READY_TO_CONNECT = "ready_to_connect",
  CONNECTED = "connected",
}

@injectable()
class WebRTCManager {
  private _ownPeer: Peer | undefined;
  private _state: WebRTCManagerStates = WebRTCManagerStates.INITIAL;
  private _eventEmitter: EventEmitter;
  constructor(
    @inject<EventEmitter>(TYPES.EventEmitter) eventEmitter: EventEmitter
  ) {
    this._eventEmitter = eventEmitter;
  }
  public init() {
    this._ownPeer = new Peer();
    this._ownPeer.on("open", (id) => {
      this._eventEmitter.emit(WebRTCEvents.OWN_PEER_OPENED, { ownPeerId: id });
    });
    this.subscribeToStore();
  }
  private subscribeToStore() {
    this._eventEmitter.addEventListener(WebRTCEvents.OWN_PEER_OPENED, (e) => {
      // @ts-ignore another error problem
      console.log("own peer opened with event ", e.detail.ownPeerId);
      this.state = WebRTCManagerStates.READY_TO_CONNECT;
    });
  }
  get state() {
    return this._state;
  }

  private set state(nextState: WebRTCManagerStates) {
    this._state = nextState;
  }
}

export default WebRTCManager;
