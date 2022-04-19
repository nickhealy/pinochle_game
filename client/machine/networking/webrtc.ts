import Connection from "./types";

class WebRTCConnection implements Connection {
  constructor() {}
  send(data: Record<any, any>): void {}
}

export default function webRTCConnect() {
  return Promise.resolve(new WebRTCConnection());
}
