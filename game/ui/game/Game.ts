import "reflect-metadata";
import { injectable, inject } from "inversify";
import TYPES from "../types/main";
import { Manager } from "../Manager";
import PreGameScene from "../scenes/preGame/PreGame.scene";
import OwnPeerManager from "../webrtc/OwnPeerManager";

@injectable()
class Game {
  protected manager: Manager;
  protected preGameScene: PreGameScene;
  protected ownPeerManager: OwnPeerManager;
  constructor(
    @inject<Manager>(TYPES.Manager) manager: Manager,
    @inject<OwnPeerManager>(TYPES.OwnPeerManager) webRtcManager: OwnPeerManager,
    @inject<PreGameScene>(TYPES.PreGameScene) preGameScene: PreGameScene
  ) {
    this.manager = manager;
    this.ownPeerManager = webRtcManager;
    this.preGameScene = preGameScene;
  }

  public launch() {
    console.log("game is launched");
    this.manager.changeScene(this.preGameScene);
    this.ownPeerManager.init();
  }
}

export default Game;
