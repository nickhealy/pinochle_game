"use strict";
(() => {
  // backend/networking/requests.ts
  var createRoom = (ownId) => {
    fetch("/rooms/create", {
      method: "POST",
      redirect: "follow",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        own_peer_id: ownId
      })
    }).then((res) => res.json()).then((data) => {
      const { link } = data;
      window.location.replace(link);
    }).catch((e) => console.error("Error in creating room : ", e));
  };

  // test_app/index.js
  var createRoomBtn = document.getElementById("create-room");
  var doCreateRoom = () => {
    const hostId = "host-12345";
    createRoomBtn.setAttribute("disabled", true);
    createRoom(hostId);
  };
  createRoomBtn.addEventListener("click", doCreateRoom);
})();
