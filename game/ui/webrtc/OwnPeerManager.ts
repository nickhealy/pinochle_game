import { inject, injectable } from "inversify";
import Peer, { DataConnection } from "peerjs";
import EventEmitter from "../events/EventEmitter";
import { WebRTCEvents } from "../events/events";
import TYPES from "../types/main";

enum WebRTCManagerStates {
  INITIAL = "initial",
  READY_TO_CONNECT = "ready_to_connect",
  CONNECTED = "connected",
}

const GET_ID_RETRIES = 10;
const RETRY_TIMEOUT = 50;

@injectable()
class WebRTCManager {
  private _ownPeer: Peer | undefined;
  private _connection: DataConnection | undefined;
  private _state: WebRTCManagerStates = WebRTCManagerStates.INITIAL;
  private _eventEmitter: EventEmitter;
  constructor(
    @inject<EventEmitter>(TYPES.EventEmitter) eventEmitter: EventEmitter
  ) {
    this._eventEmitter = eventEmitter;
  }
  public init() {
    this.addPreGameListeners();
    this.initOwnPeer();
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
  get state() {
    return this._state;
  }

  private set state(nextState: WebRTCManagerStates) {
    this._state = nextState;
  }

  async waitForId() {
    const wait = () => new Promise((res) => setTimeout(res, RETRY_TIMEOUT));
    let retriesLeft = GET_ID_RETRIES;
    while (retriesLeft-- > 0) {
      if (
        this.state !== WebRTCManagerStates.READY_TO_CONNECT ||
        !this._ownPeer?.id // shouldn't be possible, but just to be safe
      ) {
        await wait();
      } else {
        return this._ownPeer.id;
      }
    }

    throw new Error("Could not establish connection to peer server");
  }
}

export default WebRTCManager;
