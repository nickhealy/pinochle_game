import { getTestClient } from "./mockClient";

describe("TestClient", () => {
  it("can mock sending and receiving messages between clients and connections", () => {
    const [client, connection] = getTestClient();

    connection.send("hello client");
    connection.on('data', () => {})
    expect(client.onmessage).toBeCalledTimes(1);
    expect(client.onmessage).toBeCalledWith("hello client");

    client.send("hello connection");
    expect(connection.eventHandlers['data']).toBeCalledTimes(1);
    expect(connection.eventHandlers['data']).toBeCalledWith("hello connection");
  });

  it("can handle adding event listener", () => {
    const listenerCb = jest.fn();
    const [client, connection] = getTestClient();
    connection.on('data', listenerCb)

    client.send("hello new cb");
    expect(listenerCb).toBeCalledTimes(1);
    expect(listenerCb).toBeCalledWith("hello new cb");
  });

  describe("waitForMessage", () => {
    it("will consume messages until it receives desired message (sync)", async () => {
      const [client, connection] = getTestClient();
      connection.send(JSON.stringify({ type: "1", data: {} }));
      connection.send(JSON.stringify({ type: "2", data: {} }));
      connection.send(JSON.stringify({ type: "3", data: {} }));
      connection.send(JSON.stringify({ type: "4", data: {} }));
      connection.send(JSON.stringify({ type: "5", data: {} }));
      await client.waitForMessage("5");
    });

    it("will consume message from top of queue and then stop (sync)", async () => {
      const [client, connection] = getTestClient();
      connection.send(JSON.stringify({ type: "1", data: {} }));
      connection.send(JSON.stringify({ type: "2", data: {} }));
      connection.send(JSON.stringify({ type: "3", data: {} }));
      connection.send(JSON.stringify({ type: "4", data: {} }));
      connection.send(JSON.stringify({ type: "5", data: {} }));
      await client.waitForMessage("4");
      await client.waitForMessage("5");
    });

    it("will consume messages until it receives desired message (async)", async () => {
      const [client, connection] = getTestClient();
      connection.send(JSON.stringify({ type: "1", data: {} }));
      connection.send(JSON.stringify({ type: "2", data: {} }));
      connection.send(JSON.stringify({ type: "3", data: {} }));
      connection.send(JSON.stringify({ type: "4", data: {} }));

      setTimeout(() => {
        connection.send(JSON.stringify({ type: "5", data: {} }));
      }, 500);

      await client.waitForMessage("5");
    });

    it("throws error for messages client has never received", (done) => {
      const [client, connection] = getTestClient();
      connection.send(JSON.stringify({ type: "1", data: {} }));
      connection.send(JSON.stringify({ type: "2", data: {} }));
      connection.send(JSON.stringify({ type: "3", data: {} }));
      connection.send(JSON.stringify({ type: "4", data: {} }));
      connection.send(JSON.stringify({ type: "5", data: {} }));
      client.waitForMessage("6").catch((e) => {
        expect(e.message).toBe(
          `${client.metadata} Did not receive 6 message with data {}`
        );
        done();
      });
    });

    it("throws error for messages client has already received", (done) => {
      const [client, connection] = getTestClient();
      connection.send(JSON.stringify({ type: "1", data: {} }));
      connection.send(JSON.stringify({ type: "2", data: {} }));
      connection.send(JSON.stringify({ type: "3", data: {} }));
      connection.send(JSON.stringify({ type: "4", data: {} }));
      connection.send(JSON.stringify({ type: "5", data: {} }));
      client
        .waitForMessage("5")
        .then(() => client.waitForMessage("4"))
        .catch((e) => {
          expect(e.message).toBe(
            `${client.metadata} Did not receive 4 message with data {}`
          );
          done();
        });
    });

    it("alerts user if message received with incorrect data", (done) => {
      const [client, connection] = getTestClient();
      connection.send(JSON.stringify({ type: "1", data: {} }));
      connection.send(JSON.stringify({ type: "2", data: {} }));
      connection.send(JSON.stringify({ type: "3", data: {} }));
      connection.send(JSON.stringify({ type: "4", data: {} }));
      connection.send(JSON.stringify({ type: "5", data: { test: true } }));
      client.waitForMessage("5", { test: false }).catch((e) => {
        expect(e.message).toBe(
          `${client.metadata} Received 5 message, but with wrong data. Expected: {"test":false} Received: {"test":true}`
        );
        done();
      });
    });
  });
});
