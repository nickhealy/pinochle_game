import "reflect-metadata";
import { injectable, inject } from "inversify";
import TYPES from "../inversify-types";
import PreGameScene from "./scenes/preGame/PreGame.scene";
import OwnPeerManager from "./networking/OwnPeerManager";
import HostPeerManager from "./networking/HostPeerManager";
import EventEmitter from "./events/EventEmitter";
import { LobbyEvents } from "./events/events";
import LobbyView from "./scenes/lobby/LobbyView";
import GameScene from "./scenes/game/Game.scene";
import store, { StoreType } from "./store";

@injectable()
class Game {
  // private manager: Manager;
  private preGameScene: PreGameScene;
  private lobbyView: LobbyView;
  private ownPeerManager: OwnPeerManager;
  private hostPeerManager: HostPeerManager;
  private eventEmitter: EventEmitter;
  private gameScene: GameScene;
  private _store: StoreType;
  constructor(
    // @inject<Manager>(TYPES.Manager) manager: Manager,
    @inject<OwnPeerManager>(TYPES.OwnPeerManager)
    ownPeerManager: OwnPeerManager,
    @inject<HostPeerManager>(TYPES.HostPeerManager)
    hostPeerManager: HostPeerManager,
    @inject<PreGameScene>(TYPES.PreGameScene) preGameScene: PreGameScene,
    @inject<LobbyView>(TYPES.LobbyView) lobbyView: LobbyView,
    @inject<EventEmitter>(TYPES.EventEmitter) eventEmitter: EventEmitter,
    @inject<GameScene>(TYPES.GameScene) gameScene: GameScene,
    @inject<StoreType>(TYPES.Store) store: StoreType
  ) {
    this.ownPeerManager = ownPeerManager;
    this.hostPeerManager = hostPeerManager;
    this.preGameScene = preGameScene;
    this.lobbyView = lobbyView;
    this.eventEmitter = eventEmitter;
    this.gameScene = gameScene;
    this._store = store;
  }

  public launch() {
    this.initListeners();
    this.initUIDevTools();
    this.preGameScene.init();
    this.ownPeerManager.init();
    this.hostPeerManager.init();
  }

  initListeners() {
    this.eventEmitter.addEventListener(LobbyEvents.SELF_JOINED_LOBBY, () => {
      this.preGameScene.destroy();
      this.lobbyView.render();
    });
    // not the best place for this atm, but it should be ok
    this.eventEmitter.addEventListener(LobbyEvents.ROUND_START, () => {
      this.lobbyView.destroy();
      // this.bidView.render();
      this.gameScene.render();
    });
  }

  private initUIDevTools() {
    // @ts-ignore
    globalThis.devOwnHand = () => {
      this.preGameScene.destroy();
      // @ts-ignore this is necessary for devving
      this.gameScene.render();
    };
    //@ts-ignore
    globalThis.getFromStore = (key: string) => store.get(key);
  }
}

export default Game;
