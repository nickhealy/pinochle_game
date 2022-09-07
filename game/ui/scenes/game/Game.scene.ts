import { inject, injectable } from "inversify";
import TYPES from "../../../inversify-types";
import OwnHand from "./OwnHand";

@injectable()
class GameScene {
  ownHand: OwnHand;
  constructor(@inject<OwnHand>(TYPES.OwnHand) ownHand: OwnHand) {
    this.ownHand = ownHand;
  }

  render() {
    console.log("RENDERING GAME SCENE");
  }
}

export default GameScene;
