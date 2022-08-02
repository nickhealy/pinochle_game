const peers = [];
const connections = [];

function createPlayer(playerIdx) {
  const container = document.createElement("div");
  container.classList.add("player");
  container.innerHTML = `
    <h3>${playerIdx === 0 ? "HOST" : "Player " + playerIdx}</h3>
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
      (playerIdx > 0 &&
        `
      <div>
        <button class='network-join' id='join-room-${playerIdx}'>Start</button>
        <button class='network-leave' id='leave-room-${playerIdx}'>End</button>
      </div>
      `) ||
      ""
    }
  `;

  const joinBtn = container.querySelector(`#join-room-${playerIdx}`);
  if (joinBtn) {
    joinBtn.addEventListener("click", () => connectHostToPeer(playerIdx));
  }

  // make the peer
  const peer = new Peer(`peer-${playerIdx}`);
  peer.on("connection", function (conn) {
    console.log(`Peer ${playerIdx} has received connection from ${conn.peer}`);
  });

  peers.push(peer);

  return container;
}

function createPlayers() {
  const players = [];
  for (let i = 0; i < 4; i++) {
    players.push(createPlayer(i));
  }
  document.getElementById("player-container").append(...players);
}

function connectHostToPeer(playerIdx) {
  const host = peers[0];
  const conn = host.connect(`peer-${playerIdx}`);
  conn.on("open", () => {
    console.log(`Host has opened connection to ${conn.peer}`);
  });
  connections.push(conn);

  document
    .querySelector(`#join-room-${playerIdx}`)
    .setAttribute("disabled", true);
}

createPlayers();
