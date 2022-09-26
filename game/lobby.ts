import { interpret } from "xstate";
import ConnectionSupervisorMachine from "./backend/ConnectionSupervisor/machine";

console.log(ConnectionSupervisorMachine);

const lobby = interpret(ConnectionSupervisorMachine);
lobby.start();

export type Lobby = typeof lobby;
export default lobby;
