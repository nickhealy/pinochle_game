import Game from "./ui/game/Game";
import main from "./inversify.config";
import TYPES from "./inversify-types";

const game = main.get<Game>(TYPES.Game);
game.launch();
