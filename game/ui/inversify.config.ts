import { Container } from "inversify";
import Game from "./game/Game";
import TYPES from "./types/main";

const main = new Container({ defaultScope: "Singleton" });
main.bind<Game>(TYPES.Game).to(Game);

export default main;
