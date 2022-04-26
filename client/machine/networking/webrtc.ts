import Connection from "./types";

class WebRTCConnection implements Connection {
  constructor() {}
  send(data: string): void {}
  onmessage(data: string): void {}
}

export default function getWebRtcConnection(metadata: string | undefined) {
  return Promise.resolve(new WebRTCConnection());
}
