import Game from "./ui/game/Game";
import main from "./ui/inversify.config";
import TYPES from "./ui/types/main";

const game = main.get<Game>(TYPES.Game);
game.launch();
