import { inject, injectable } from "inversify";
import TYPES from "../../../inversify-types";
import OtherHand from "./OtherHand";
import OwnHand from "./OwnHand";

@injectable()
class GameScene {
  private ownHand: OwnHand;
  private otherHandWest: OtherHand;
  private _container: HTMLDivElement;
  constructor(
    @inject<OwnHand>(TYPES.OwnHand) ownHand: OwnHand,
    @inject<OtherHand>(TYPES.OtherHandWest) otherHandWest: OtherHand
  ) {
    this.ownHand = ownHand;
    this.otherHandWest = otherHandWest;
    this._container = document.getElementById(
      "gameplay-container"
    ) as HTMLDivElement;
  }

  render() {
    this._container.classList.remove("hidden");
    this.ownHand.render();
    this.otherHandWest.render();
  }
}

export default GameScene;
