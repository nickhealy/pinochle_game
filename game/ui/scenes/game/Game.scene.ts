import { inject, injectable } from "inversify";
import TYPES from "../../../inversify-types";
import OtherHand from "./OtherHand";
import OwnHand from "./OwnHand";

@injectable()
class GameScene {
  private ownHand: OwnHand;
  private otherHandWest: OtherHand;
  private otherHandNorth: OtherHand;
  private otherHandEast: OtherHand;
  private _container: HTMLDivElement;
  constructor(
    @inject<OwnHand>(TYPES.OwnHand) ownHand: OwnHand,
    @inject<OtherHand>(TYPES.OtherHandWest) otherHandWest: OtherHand,
    @inject<OtherHand>(TYPES.OtherHandNorth) otherHandNorth: OtherHand,
    @inject<OtherHand>(TYPES.OtherHandEast) otherHandEast: OtherHand
  ) {
    this.ownHand = ownHand;
    this.otherHandWest = otherHandWest;
    this.otherHandNorth = otherHandNorth;
    this.otherHandEast = otherHandEast;
    this._container = document.getElementById(
      "gameplay-container"
    ) as HTMLDivElement;
  }

  render() {
    this._container.classList.remove("hidden");
    this.ownHand.render();
    this.otherHandWest.render();
    this.otherHandNorth.render();
    this.otherHandEast.render();
  }
}

export default GameScene;
