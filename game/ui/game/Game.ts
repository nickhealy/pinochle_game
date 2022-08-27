import "reflect-metadata";
import { injectable, inject } from "inversify";
import WelcomeStage from "../scenes/welcome/Welcome.scene";
import TYPES from "../types/main";
import { Manager } from "../Manager";

@injectable()
class Game {
  protected manager: Manager;
  protected ws: WelcomeStage;
  constructor(
    @inject<Manager>(TYPES.Manager) manager: Manager,
    @inject<WelcomeStage>(TYPES.WelcomeStage) ws: WelcomeStage
  ) {
    this.manager = manager;
    this.ws = ws;
  }

  public launch() {
    console.log("game is launched");
    this.manager.changeScene(this.ws);
  }
}

export default Game;
