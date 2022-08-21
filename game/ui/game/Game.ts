import "reflect-metadata";
import { injectable, inject } from "inversify";

@injectable()
class Game {
  constructor() {}

  public launch() {
    console.log("game is launched");
  }
}

export default Game;
