import { inject, injectable } from "inversify";
import Peer from "peerjs";
import EventEmitter from "../events/EventEmitter";
import { WebRTCEvents } from "../events/events";
import TYPES from "../../inversify-types";
import WebRTCManager, { WebRTCManagerStates } from "./WebRTCManager";

const CONNECTION_TIMEOUT = 500;

@injectable()
class HostPeerManager extends WebRTCManager {
  _hostPeer: Peer | undefined;
  _eventEmitter: EventEmitter;
  constructor(
    @inject<EventEmitter>(TYPES.EventEmitter) eventEmitter: EventEmitter
  ) {
    super();
    this._eventEmitter = eventEmitter;
  }
  init() {
    this.initHostPeer();
  }
  private initHostPeer() {
    this._hostPeer = new Peer();
    this._hostPeer.on("open", (id) => {
      this._eventEmitter.emit(WebRTCEvents.HOST_PEER_OPENED, {
        hostPeerId: id,
      });
    });
    this.addPreGameListeners();
  }
  get peer() {
    return this._hostPeer;
  }

  private addPreGameListeners() {
    this._eventEmitter.addEventListener(WebRTCEvents.HOST_PEER_OPENED, (e) => {
      // @ts-ignore another error problem
      console.log("host peer opened with event ", e.detail.hostPeerId);
      this.state = WebRTCManagerStates.READY_TO_CONNECT;
    });
  }

  async connect() {
    await this.waitForId(); // to ensure we have connected to peer server
    return new Promise((res, rej) => {
      if (!this.peer) {
        rej(new Error("host peer does not exist"));
        return;
      }
      const connectionTimeout = setTimeout(
        () => rej(new Error("Host could not connect to peer")),
        CONNECTION_TIMEOUT
      );

      this.peer.on("connection", (conn) => {
        clearTimeout(connectionTimeout);
        this._connection = conn;
        this.state = WebRTCManagerStates.CONNECTED;
        this._eventEmitter.emit(WebRTCEvents.HOST_PEER_CONNECTED);
        res(this._connection);
      });
    });
  }
}

export default HostPeerManager;
