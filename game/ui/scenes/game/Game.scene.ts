import "reflect-metadata";
import { inject, injectable } from "inversify";
import * as inversify from "inversify";
import TYPES from "../../../inversify-types";
import OtherPlayer from "./OtherPlayer";
import OwnHand from "./OwnHand";
import { OpponentPosition } from "./OtherHand";

@injectable()
class GameScene {
  private ownHand: OwnHand;
  private otherPlayerWest: OtherPlayer;
  private otherPlayerNorth: OtherPlayer;
  private otherPlayerEast: OtherPlayer;
  private _container: HTMLDivElement;
  constructor(
    @inject<OwnHand>(TYPES.OwnHand) ownHand: OwnHand,
    @inject(TYPES.OtherPlayerFactory)
    otherPlayerFactory: (position: OpponentPosition) => OtherPlayer
  ) {
    this.ownHand = ownHand;
    this.otherPlayerWest = otherPlayerFactory(OpponentPosition.WEST);
    this.otherPlayerNorth = otherPlayerFactory(OpponentPosition.NORTH);
    this.otherPlayerEast = otherPlayerFactory(OpponentPosition.EAST);
    this._container = document.getElementById(
      "gameplay-container"
    ) as HTMLDivElement;
  }

  render() {
    this._container.classList.remove("hidden");
    this.ownHand.render();
    this.otherPlayerWest.render();
    this.otherPlayerNorth.render();
    this.otherPlayerEast.render();
  }
}

export default GameScene;
