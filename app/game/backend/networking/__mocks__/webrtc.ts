import { getMockConnection } from "../__tests__/mockClient";

export default function getWebRtcConnection(metadata: string) {
  return Promise.resolve(getMockConnection(metadata));
}
