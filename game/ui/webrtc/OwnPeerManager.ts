import { inject, injectable } from "inversify";
import Peer, { DataConnection } from "peerjs";
import EventEmitter from "../events/EventEmitter";
import { WebRTCEvents } from "../events/events";
import TYPES from "../types/main";
import WebRTCManager from "./WebRTCManager";

enum WebRTCManagerStates {
  INITIAL = "initial",
  READY_TO_CONNECT = "ready_to_connect",
  CONNECTED = "connected",
}

@injectable()
class OwnPeerManager extends WebRTCManager {
  private _ownPeer: Peer | undefined;
  private _connection: DataConnection | undefined;
  private _eventEmitter: EventEmitter;
  constructor(
    @inject<EventEmitter>(TYPES.EventEmitter) eventEmitter: EventEmitter
  ) {
    super();
    this._eventEmitter = eventEmitter;
  }
  public init() {
    this.addPreGameListeners();
    this.initOwnPeer();
  }

  get peer() {
    return this._ownPeer;
  }

  private initOwnPeer() {
    this._ownPeer = new Peer();
    this._ownPeer.on("open", (id) => {
      this._eventEmitter.emit(WebRTCEvents.OWN_PEER_OPENED, { ownPeerId: id });
    });
    this._ownPeer.on("connection", (conn) => {
      this._connection = conn;
      this._eventEmitter.emit(WebRTCEvents.OWN_PEER_CONNECTED);
      this.addGamePlayListeners.bind(this)();
    });
  }

  private addPreGameListeners() {
    this._eventEmitter.addEventListener(WebRTCEvents.OWN_PEER_OPENED, (e) => {
      // @ts-ignore another error problem
      console.log("own peer opened with event ", e.detail.ownPeerId);
      this.state = WebRTCManagerStates.READY_TO_CONNECT;
    });
    this._eventEmitter.addEventListener(WebRTCEvents.OWN_PEER_CONNECTED, () => {
      // @ts-ignore another error problem
      console.log("own peer connected ");
      this.state = WebRTCManagerStates.CONNECTED;
    });
  }

  private addGamePlayListeners() {
    if (!this._connection) {
      console.error("Connection doesn't exist");
      return;
    }

    this._connection.on("data", () => {
      // init game play listeners
    });
  }
}

export default OwnPeerManager;
