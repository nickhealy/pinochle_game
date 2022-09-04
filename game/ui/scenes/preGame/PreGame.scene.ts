import "reflect-metadata";
import { injectable, inject } from "inversify";
import TYPES from "../../../inversify-types";
import ViewManager from "../../HTMLContentLayer/HTMLViewManager";
import WelcomeView from "./WelcomeView";
import JoinGameView from "./JoinGameView";
import EventEmitter from "../../events/EventEmitter";
import { PreGameEvents } from "../../events/events";
import NewGameView from "./NewGameView";

@injectable()
class PreGameScene {
  private viewManager: ViewManager;
  private welcomeView: WelcomeView;
  private joinGameView: JoinGameView;
  private newGameView: NewGameView;
  private _eventEmitter: EventEmitter;
  constructor(
    @inject<EventEmitter>(TYPES.EventEmitter) eventEmitter: EventEmitter,
    @inject<ViewManager>(TYPES.ViewManager) viewManager: ViewManager,
    @inject<WelcomeView>(TYPES.WelcomeView) welcomeView: WelcomeView,
    @inject<JoinGameView>(TYPES.JoinGameView) joinGameView: JoinGameView,
    @inject<NewGameView>(TYPES.NewGameView) newGameView: NewGameView
  ) {
    this.viewManager = viewManager;
    this.welcomeView = welcomeView;
    this.joinGameView = joinGameView;
    this.newGameView = newGameView;
    this._eventEmitter = eventEmitter;
  }
  init() {
    this.registerListeners();
    this.renderWelcomeView();
  }
  registerListeners() {
    this._eventEmitter.addEventListener(
      PreGameEvents.GO_TO_JOIN_GAME,
      this.goToJoinGameView.bind(this)
    );
    this._eventEmitter.addEventListener(
      PreGameEvents.GO_TO_NEW_GAME,
      this.goToNewGameView.bind(this)
    );
    this._eventEmitter.addEventListener(
      PreGameEvents.GO_BACK,
      this.goBack.bind(this)
    );
  }
  goBack() {
    this.viewManager.goBack();
  }
  renderWelcomeView() {
    this.viewManager.render(this.welcomeView);
  }
  goToJoinGameView() {
    this.viewManager.render(this.joinGameView);
  }
  goToNewGameView() {
    this.viewManager.render(this.newGameView);
  }
  destroy() {
    this.viewManager.destroyCurrentView();
  }
}

export default PreGameScene;
