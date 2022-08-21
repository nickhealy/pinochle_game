import { getMockConnection } from "../__tests__/mockClient";

export function getWebRTCClient(metadata: string) {
  return Promise.resolve(getMockConnection(metadata));
}
