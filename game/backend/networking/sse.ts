import lobby from "../../lobby";
let evtSource: EventSource;
export const initSSEListener = (roomId: string) => {
  evtSource = new EventSource(`/listen/${roomId}`);
  evtSource.onopen = () =>
    console.log("Host is connected to SSE from room ", roomId);

  evtSource.onmessage = (e) => {
    const { peer_id: peerId, event } = JSON.parse(e.data);
    // not ideal, we should be able to just listen to a custom event, but
    // i couldn't get that to work :(
    if (event === "player_join_request") {
      lobby.send({
        type: "PLAYER_JOIN_REQUEST",
        connection_info: peerId,
        name: "Joe",
      });
    } else {
      console.log("EventSource received unknown SSE event : ", e);
    }
  };
};
