import { interpret } from "xstate";
import ConnectionSupervisorMachine from "./backend/ConnectionSupervisor/machine";

const lobby = interpret(ConnectionSupervisorMachine);
lobby.start();

export default lobby;
