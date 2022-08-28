import "reflect-metadata";
import { injectable, inject } from "inversify";
import Background from "../../containers/background/Background";
import TYPES from "../../types/main";
import { Scene } from "../Scene";
import { Application, DisplayObject, Container } from "pixi.js";
import HTMLContentLayer from "../../containers/HTMLContentLayer/HTMLContentLayer";
import ViewManager from "../../containers/HTMLContentLayer/HTMLViewManager";
import WelcomeView from "./WelcomeView";
import JoinGameView from "./JoinGameView";

export enum PreGameUIEvents {
  JOIN_GAME_PRESSED = "join_game_pressed",
  NEW_GAME_PRESSED = "new_game_pressed",
  BACK_BTN_PRESSED = "back_btn_pressed",
}

@injectable()
class PreGameScene extends Scene {
  private viewManager: ViewManager;
  private welcomeView: WelcomeView;
  private joinGameView: JoinGameView;
  private htmlLayer: HTMLContentLayer;
  private _listeners: Record<PreGameUIEvents, () => void>;
  constructor(
    @inject<Background>(TYPES.Application) app: Application,
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
    this._listeners = {
      [PreGameUIEvents.BACK_BTN_PRESSED]: this.goBack,
      [PreGameUIEvents.JOIN_GAME_PRESSED]: this.goToJoinGameView,
      [PreGameUIEvents.NEW_GAME_PRESSED]: this.goToNewGameView,
    };
  }
  dispatchEvent(event: PreGameUIEvents) {
    const fn = this._listeners[event];
    if (!fn) {
      console.error("unrecognized pregame scene ui event : ", event);
    } else {
      fn.bind(this)();
    }
  }
  init() {
    this.viewManager.init(this.welcomeView.view);
    this.joinGameView.registerDispatch(this.dispatchEvent.bind(this));
    this.welcomeView.registerDispatch(this.dispatchEvent.bind(this));
    this.renderWelcomeView();
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
