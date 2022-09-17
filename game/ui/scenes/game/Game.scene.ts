import { inject, injectable } from "inversify";
import TYPES from "../../../inversify-types";
import OwnHand from "./OwnHand";

@injectable()
class GameScene {
  private ownHand: OwnHand;
  private _container: HTMLDivElement;
  constructor(@inject<OwnHand>(TYPES.OwnHand) ownHand: OwnHand) {
    this.ownHand = ownHand;
    this._container = document.getElementById(
      "gameplay-container"
    ) as HTMLDivElement;
  }

  render() {
    console.log("RENDERING GAME SCENE");
    this.ownHand.render();
    this._container.classList.remove("hidden");
  }
}

export default GameScene;
