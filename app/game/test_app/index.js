import { createRoom } from "../backend/networking/requests";
const createRoomBtn = document.getElementById("create-room");
const doCreateRoom = () => {
  const hostId = "host-12345";
  createRoomBtn.setAttribute("disabled", true);
  createRoom(hostId);
};

createRoomBtn.addEventListener("click", doCreateRoom);
