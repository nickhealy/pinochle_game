import "reflect-metadata";
import { injectable, inject } from "inversify";
import TYPES from "../inversify-types";
import PreGameScene from "./scenes/preGame/PreGame.scene";
import OwnPeerManager from "./networking/OwnPeerManager";
import HostPeerManager from "./networking/HostPeerManager";
import EventEmitter from "./events/EventEmitter";
import { LobbyEvents, PreGameEvents } from "./events/events";
import LobbyView from "./scenes/lobby/LobbyView";

@injectable()
class Game {
  // private manager: Manager;
  private preGameScene: PreGameScene;
  private lobbyView: LobbyView;
  private ownPeerManager: OwnPeerManager;
  private hostPeerManager: HostPeerManager;
  private eventEmitter: EventEmitter;
  constructor(
    // @inject<Manager>(TYPES.Manager) manager: Manager,
    @inject<OwnPeerManager>(TYPES.OwnPeerManager)
    ownPeerManager: OwnPeerManager,
    @inject<HostPeerManager>(TYPES.HostPeerManager)
    hostPeerManager: HostPeerManager,
    @inject<PreGameScene>(TYPES.PreGameScene) preGameScene: PreGameScene,
    @inject<LobbyView>(TYPES.LobbyView) lobbyView: LobbyView,
    @inject<EventEmitter>(TYPES.EventEmitter) eventEmitter: EventEmitter
  ) {
    this.ownPeerManager = ownPeerManager;
    this.hostPeerManager = hostPeerManager;
    this.preGameScene = preGameScene;
    this.lobbyView = lobbyView;
    this.eventEmitter = eventEmitter;
  }

  public launch() {
    this.initListeners();
    this.preGameScene.init();
    this.ownPeerManager.init();
    this.hostPeerManager.init();
  }

  initListeners() {
    this.eventEmitter.addEventListener(LobbyEvents.SELF_JOINED_LOBBY, () => {
      this.preGameScene.destroy();
      this.lobbyView.render();
    });
  }
}

export default Game;