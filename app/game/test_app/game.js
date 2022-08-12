import Peer from "peerjs";
import { joinRoom } from "../backend/networking/requests";
import lobby from "../lobby";

function createPlayer(isHost) {
  const container = document.createElement("div");
  container.classList.add("player");
  container.innerHTML = `
    <p>${window.location.href}</p>
    <h3>${isHost ? "HOST" : "Player "}</h3>
    <div id='hand-container'>
      
    </div>
    <button type="button" id='playcard-btn'>Play Card</button>
    <div>
      <textarea placeholder='bid' id='bid-area'></textarea>
      <button type='button' id='bid-btn'>Bid</button>
      <button type='button' id='pass-btn'>Pass</button>
      <button type='button' id='hez-btn'>Hez</button>
    </div>
    ${
      (isHost && "<button id='start-game' disabled>START GAME</button>") ||
      `
      <div>
        <button class='network-join' id='join-room' disabled>Start</button>
        <button class='network-leave' id='leave-room' disabled>End</button>
      </div>
`
    }
  `;
  return container;
}

const container = document.getElementById("player-container");
container.append(createPlayer(IS_HOST));
// set up peer connection
if (IS_HOST) {
  window._host_peer = new Peer(undefined, { debug: 3 });
  window._host_connected = false
  window._host_peer.on('error', console.error)
  window._host_peer.on("open", (id) => {
    window._host_connected = true
    console.log("host peer connected to peer server, id is ", id);
  });
}

window.peer = new Peer(); // this will also have to be a singleton somehow
window.peer.on("open", (id) => {
  console.log("Connected to Peer server, my id is ", id);
  if (!IS_HOST) {
    document.getElementById("join-room").removeAttribute("disabled");
  } else {
    console.log("inside this thing");
    lobby.send({
      type: "PLAYER_JOIN_REQUEST",
      connection_info: window.peer.id,
      name: "host",
    });
  }
});

window.peer.on("connection", (conn) => {
  console.log("Just connected to ", conn.peer);
  if (!IS_HOST) {
    document.getElementById("join-room").setAttribute("disabled", true);
    document.getElementById("leave-room").removeAttribute("disabled");
  }

  conn.on("data", (data) => {
    console.log("received : ", data);
    const { type } = JSON.parse(data);

    switch (type) {
      case "lobby.all_players_connected":
        const startBtn = document.getElementById("start-game");
        if (IS_HOST) {
          debugger;
          startBtn.addEventListener("click", () =>
            conn.send(
              JSON.stringify({
                event: "lobby.start_game",
              })
            )
          );
          startBtn.removeAttribute("disabled");
        }
        break;
      default:
        break;
      // console.error("received unknown event : ", data);
    }
  });
});

let evtSource;
if (IS_HOST) {
  // listen to SSEs
  evtSource = new EventSource(`/listen/${window._room_id}`);
  evtSource.onmessage = (e) => {
    const { event, peer_id: peerId } = JSON.parse(e.data);
    switch (event) {
      case "player_join_request":
        lobby.send({
          type: "PLAYER_JOIN_REQUEST",
          connection_info: peerId,
          name: "Nick",
        });
        break;
      default:
        console.log("unrecognized SSE event : ", event);
    }
  };
} else {
  document
    .getElementById("join-room")
    .addEventListener("click", () => joinRoom(window._room_id, window.peer.id));
}
