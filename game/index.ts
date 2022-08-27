import * as PIXI from "pixi.js";
import Game from "./ui/game/Game";
import main from "./ui/inversify.config";
import TYPES from "./ui/types/main";

(<any>window).__PIXI_INSPECTOR_GLOBAL_HOOK__ &&
  (<any>window).__PIXI_INSPECTOR_GLOBAL_HOOK__.register({ PIXI: PIXI });

const game = main.get<Game>(TYPES.Game);
game.launch();
