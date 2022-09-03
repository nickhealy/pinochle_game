import { injectable } from "inversify";

const EVENT_SOURCE_URL_BASE = "/listen/";
const CONNECTION_RETRIES = 5;
const CONNECTION_TIMEOUT = 50;

@injectable()
class EventSourceManager {
  private _eventSource: EventSource | undefined;
  private _roomId: string | undefined;

  async startListening(roomId: string) {
    this._roomId = roomId;
    const ev = new EventSource(`${EVENT_SOURCE_URL_BASE}${this._roomId}`);
    let retriesLeft = CONNECTION_RETRIES;

    const retry = () =>
      new Promise((res) => setTimeout(res, CONNECTION_TIMEOUT));

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
    console.log("initialzied event source listeners");
  }
}

export default EventSourceManager;
