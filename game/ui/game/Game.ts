import "reflect-metadata";
import { injectable, inject } from "inversify";
import TYPES from "../../inversify-types";
import { Manager } from "../Manager";
import PreGameScene from "../scenes/preGame/PreGame.scene";
import OwnPeerManager from "../webrtc/OwnPeerManager";
import HostPeerManager from "../webrtc/HostPeerManager";

@injectable()
class Game {
  private manager: Manager;
  private preGameScene: PreGameScene;
  private ownPeerManager: OwnPeerManager;
  private hostPeerManager: HostPeerManager;
  constructor(
    @inject<Manager>(TYPES.Manager) manager: Manager,
    @inject<OwnPeerManager>(TYPES.OwnPeerManager)
    ownPeerManager: OwnPeerManager,
    @inject<HostPeerManager>(TYPES.HostPeerManager)
    hostPeerManager: HostPeerManager,
    @inject<PreGameScene>(TYPES.PreGameScene) preGameScene: PreGameScene
  ) {
    this.manager = manager;
    this.ownPeerManager = ownPeerManager;
    this.hostPeerManager = hostPeerManager;
    this.preGameScene = preGameScene;
  }

  public launch() {
    this.manager.changeScene(this.preGameScene);
    this.ownPeerManager.init();
    this.hostPeerManager.init();
  }
}

export default Game;
