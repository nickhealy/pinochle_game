import { injectable } from "inversify";
import Peer, { DataConnection } from "peerjs";

export enum WebRTCManagerStates {
  INITIAL = "initial",
  READY_TO_CONNECT = "ready_to_connect",
  CONNECTED = "connected",
}

const GET_ID_RETRIES = 10;
const RETRY_TIMEOUT = 50;

@injectable()
abstract class WebRTCManager {
  private _state: WebRTCManagerStates = WebRTCManagerStates.INITIAL;
  protected _connection: DataConnection | undefined;
  constructor() {}

  abstract init(): void;
  abstract get peer(): Peer | undefined;

  get state() {
    return this._state;
  }

  protected set state(nextState: WebRTCManagerStates) {
    this._state = nextState;
  }

  async waitForId() {
    const wait = () => new Promise((res) => setTimeout(res, RETRY_TIMEOUT));
    let retriesLeft = GET_ID_RETRIES;
    while (retriesLeft-- > 0) {
      if (
        this.state !== WebRTCManagerStates.READY_TO_CONNECT ||
        !this.peer?.id // shouldn't be possible, but just to be safe
      ) {
        await wait();
      } else {
        return this.peer.id;
      }
    }

    throw new Error("Could not establish connection to peer server");
  }
}

export default WebRTCManager;
