import "reflect-metadata";
import { injectable, inject } from "inversify";
import WelcomeStage from "../scenes/welcome/PreGame.scene";
import TYPES from "../types/main";
import { Manager } from "../Manager";
import PreGameScene from "../scenes/welcome/PreGame.scene";

@injectable()
class Game {
  protected manager: Manager;
  protected preGameScene: PreGameScene;
  constructor(
    @inject<Manager>(TYPES.Manager) manager: Manager,
    @inject<PreGameScene>(TYPES.PreGameScene) preGameScene: PreGameScene
  ) {
    this.manager = manager;
    this.preGameScene = preGameScene;
  }

  public launch() {
    console.log("game is launched");
    this.manager.changeScene(this.preGameScene);
  }
}

export default Game;
