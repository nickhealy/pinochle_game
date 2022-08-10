import WebRTCClient from "./backend/networking/webrtc";
import ConnectionSupervisorMachine from "./backend/ConnectionSupervisor/machine";
import { Peer } from "peerjs";
import { interpret } from "xstate";

// roomId will come from params
const init = (id: string, isHost: boolean = false) => {
  const peer = new Peer(id);
};
