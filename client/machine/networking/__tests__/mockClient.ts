import Connection from "../types";

class MockWebRTCConnection implements Connection {
  _client: TestClient | undefined;
  constructor() {}
  send(data: string): void {
    if (!this._client) {
      throw new Error(
        "MockWebRTCConnection needs a ref to TestClient before it can send or receive data"
      );
    }
    this._client.onmessage(data);
    this.onmessage = jest.fn(this.onmessage);
  }

  onmessage(data: string): void {}

  addTestClient(client: TestClient) {
    this._client = client;
  }
}

class TestClient {
  _connection: MockWebRTCConnection;
  id: string;
  constructor(connection: MockWebRTCConnection, id: string) {
    this._connection = connection;
    this.id = id;
    this.onmessage = jest.fn(this.onmessage);

    this._connection.addTestClient(this);
  }

  send(data: string) {
    this._connection.onmessage(data);
  }

  onmessage(data: string) {
    return jest.fn();
  }
}

export function getTestClient() {
  const clientId = (Math.random() + 1).toString(36).substring(7);
  const connection = new MockWebRTCConnection();
  clientIdByConnection[clientId] = connection;
  return [new TestClient(connection, clientId), connection] as const;
}

const clientIdByConnection: Record<string, MockWebRTCConnection> = {};

export function getMockConnection(metadata: string) {
  return clientIdByConnection[metadata];
}
