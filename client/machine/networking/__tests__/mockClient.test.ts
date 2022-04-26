import { getTestClient } from "./mockClient";

describe("mockWebRtcClient", () => {
  it("can mock sending and receiving messages between clients and connections", () => {
    const [client, connection] = getTestClient();

    connection.send("hello client");
    expect(client.onmessage).toBeCalledTimes(1);
    expect(client.onmessage).toBeCalledWith("hello client");

    client.send("hello connection");
    expect(connection.onmessage).toBeCalledTimes(1);
    expect(connection.onmessage).toBeCalledWith("hello connection");
  });

  it("can handle overriding onmessage method", () => {
    const overridingMethod = jest.fn();
    const [client, connection] = getTestClient();
    connection.onmessage = overridingMethod;

    client.send("hello new method");
    expect(overridingMethod).toBeCalledTimes(1);
    expect(overridingMethod).toBeCalledWith("hello new method");
  });
});
