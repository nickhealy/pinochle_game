import { interpret } from "xstate";
import ConnectionSupervisorMachine from "./backend/ConnectionSupervisor/machine";

const lobby = interpret(ConnectionSupervisorMachine);
lobby.start();

export type Lobby = typeof lobby;
export default lobby;
