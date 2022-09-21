import { inject, injectable } from "inversify";
import TYPES from "../../inversify-types";
import { Lobby } from "../../lobby";
import { mockEV } from "./mocks";

const EVENT_SOURCE_URL_BASE = "/listen/";
const CONNECTION_RETRIES = 5;
const CONNECTION_TIMEOUT = 50;

@injectable()
class EventSourceManager {
  private _eventSource: EventSource | undefined;
  private _roomId: string | undefined;
  private lobby: Lobby;

  constructor(@inject<Lobby>(TYPES.Lobby) lobby: Lobby) {
    this.lobby = lobby;
  }

  async startListening(roomId: string) {
    this._roomId = roomId;
    // @ts-ignore
    const ev = globalThis._useMocks
      ? (mockEV as unknown as EventSource) // for mocking
      : new EventSource(`${EVENT_SOURCE_URL_BASE}${this._roomId}`);

    let retriesLeft = CONNECTION_RETRIES;

    const retry = () =>
      new Promise((res) => setTimeout(res, CONNECTION_TIMEOUT));

    console.log({ retriesLeft });
    while (retriesLeft-- > 0) {
      if (ev.readyState === ev.OPEN) {
        this._eventSource = ev;
        this.initListeners();
        return;
      }
      await retry();
    }
    return new Error("could not open event source");
  }

  private initListeners() {
    if (!this._eventSource) {
      throw new Error("EventSource not initialized");
    }
    this._eventSource.onmessage = (ev) => {
      const { event, peer_id: peerId, name } = JSON.parse(ev.data);
      switch (event) {
        case "player_join_request":
          this.lobby.send({
            type: "PLAYER_JOIN_REQUEST",
            connection_info: peerId,
            name,
          });
          break;
        default:
          console.log("unrecognized SSE event : ", event);
      }
    };
  }
}

export default EventSourceManager;
