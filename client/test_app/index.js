function createPlayer(playerId) {
  const container = document.createElement('div')
  container.classList.add('player')
  container.innerHTML=`
    <h3>${playerId === 0 ? 'HOST' : 'Player ' + playerId}</h3>
    <div id='hand-container'>
      
    </div>
    <button type="button" id='playcard-btn'>Play Card</button>
    <div>
      <textarea placeholder='bid' id='bid-area'></textarea>
      <button type='button' id='bid-btn'>Bid</button>
      <button type='button' id='pass-btn'>Pass</button>
      <button type='button' id='hez-btn'>Hez</button>
    </div>
    <div>
      <button id='join-room'>Start</button>
      <button id='leave-room'>End</button>
    </div>
  `
  return container
}

function createPlayers() {
  const players = [];
  for (let i = 0; i < 4; i++) {
    players.push(createPlayer(i))
  }
  document.getElementById('player-container').append(...players)
}

createPlayers()
