export const joinRoom = async (
  roomId: string,
  { ownPeerId, name }: { ownPeerId: string; name: string }
) => {
  // @ts-ignore
  if (globalThis._useMocks) {
    return { room_id: "1234" };
  }
  const res = await fetch(`/rooms/${roomId}/join`, {
    method: "POST",
    redirect: "follow",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      peer_id: ownPeerId,
    }),
  });
  if (res.status !== 200) {
    // this could be custom error type
    throw new Error("error joining the game");
  }
  return await res.json();
};

export const createRoom = async (ownId: string) => {
  // @ts-ignore
  if (globalThis._useMocks) {
    return { room_id: "1234" };
  }
  const res = await fetch("/rooms/create", {
    method: "POST",
    redirect: "follow",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      own_peer_id: ownId,
    }),
  });
  if (res.status !== 200) {
    // this could be custom error type
    throw new Error("error creating the room");
  }
  const json = await res.json();
  return json;
};
