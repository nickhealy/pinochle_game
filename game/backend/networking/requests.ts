export const createRoom = (ownId: string) => {
  fetch("/rooms/create", {
    method: "POST",
    redirect: "follow",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      own_peer_id: ownId,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      const { link, room_id } = data; // this could be redux or something
      // @ts-expect-error
      window._room_id = room_id;
      window.location.replace(link);
    })
    .catch((e) => console.error("Error in creating room : ", e));
};

export const joinRoom = (roomId: string, ownPeerId: string) => {
  fetch(`/rooms/${roomId}/join`, {
    method: "POST",
    redirect: "follow",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      peer_id: ownPeerId,
    }),
  })
    .then((res) => res.json())
    .then(() => console.log("Requested to join room"))
    .catch((e) => console.error("Error in joining room : ", e));
};
