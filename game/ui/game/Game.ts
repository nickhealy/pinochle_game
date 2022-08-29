import "reflect-metadata";
import { injectable, inject } from "inversify";
import WelcomeStage from "../scenes/preGame/PreGame.scene";
import TYPES from "../types/main";
import { Manager } from "../Manager";
import PreGameScene from "../scenes/preGame/PreGame.scene";
import WebRTCManager from "../webrtc/OwnPeerManager";

@injectable()
class Game {
  protected manager: Manager;
  protected preGameScene: PreGameScene;
  protected webRTCManager: WebRTCManager;
  constructor(
    @inject<Manager>(TYPES.Manager) manager: Manager,
    @inject<WebRTCManager>(TYPES.WebRtcManager) webRtcManager: WebRTCManager,
    @inject<PreGameScene>(TYPES.PreGameScene) preGameScene: PreGameScene
  ) {
    this.manager = manager;
    this.webRTCManager = webRtcManager;
    this.preGameScene = preGameScene;
  }

  public launch() {
    console.log("game is launched");
    this.manager.changeScene(this.preGameScene);
    this.webRTCManager.init();
  }
}

export default Game;
