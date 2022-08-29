import "reflect-metadata";
import { injectable, inject } from "inversify";
import Background from "../../containers/background/Background";
import TYPES from "../../../inversify-types";
import { Scene } from "../Scene";
import { Application, DisplayObject, Container } from "pixi.js";
import HTMLContentLayer from "../../containers/HTMLContentLayer/HTMLContentLayer";
import ViewManager from "../../containers/HTMLContentLayer/HTMLViewManager";
import WelcomeView from "./WelcomeView";
import JoinGameView from "./JoinGameView";
import EventEmitter from "../../events/EventEmitter";
import { PreGameEvents } from "../../events/events";

@injectable()
class PreGameScene extends Scene {
  private viewManager: ViewManager;
  private welcomeView: WelcomeView;
  private joinGameView: JoinGameView;
  private htmlLayer: HTMLContentLayer;
  private _eventEmitter: EventEmitter;
  constructor(
    @inject<Background>(TYPES.Application) app: Application,
    @inject<EventEmitter>(TYPES.EventEmitter) eventEmitter: EventEmitter,
    @inject<HTMLContentLayer>(TYPES.HtmlContentLayer)
    htmlLayer: HTMLContentLayer,
    @inject<ViewManager>(TYPES.ViewManager) viewManager: ViewManager,
    @inject<WelcomeView>(TYPES.WelcomeView) welcomeView: WelcomeView,
    @inject<JoinGameView>(TYPES.JoinGameView) joinGameView: JoinGameView
  ) {
    super(app);
    this.htmlLayer = htmlLayer;
    this.viewManager = viewManager;
    this.welcomeView = welcomeView;
    this.joinGameView = joinGameView;
    this._eventEmitter = eventEmitter;
  }
  init() {
    this.viewManager.init(this.welcomeView.view);
    this.renderWelcomeView();
    this.registerListeners();
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
  createScene(): DisplayObject {
    return new Container(); // playing around with having blank container
  }
  sayHello() {
    console.log("hello from ws");
  }
  goBack() {
    this.viewManager.goBack();
  }
  renderWelcomeView() {
    this.htmlLayer.renderContent(this.viewManager.view);
  }
  goToJoinGameView() {
    this.viewManager.transition(this.joinGameView.view);
  }
  goToNewGameView() {
    console.log("going to new game view");
  }
}

export default PreGameScene;
