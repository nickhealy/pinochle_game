import "reflect-metadata";
import { injectable, inject } from "inversify";
import Background from "../../containers/background/Background";
import TYPES from "../../types/main";
import { Scene } from "../Scene";
import { Application, DisplayObject, Container } from "pixi.js";
import HTMLContentLayer from "../../containers/HTMLContentLayer/HTMLContentLayer";
import {
  createButton,
  createCenteredContainer,
  createSpacer,
  Spacer,
} from "../../containers/HTMLContentLayer/utils";
import ViewManager from "../../containers/HTMLContentLayer/HTMLViewManager";
import WelcomeView from "./WelcomeView";

@injectable()
class PreGameScene extends Scene {
  private viewManager: ViewManager;
  private welcomeView: WelcomeView;
  private htmlLayer: HTMLContentLayer;
  constructor(
    @inject<Background>(TYPES.Application) app: Application,
    @inject<HTMLContentLayer>(TYPES.HtmlContentLayer)
    htmlLayer: HTMLContentLayer,
    @inject<ViewManager>(TYPES.ViewManager) viewManager: ViewManager,
    @inject<WelcomeView>(TYPES.WelcomeView) welcomeView: WelcomeView
  ) {
    super(app);
    this.htmlLayer = htmlLayer;
    this.viewManager = viewManager;
    this.welcomeView = welcomeView;
  }
  init() {
    this.renderContainer();
  }
  createScene(): DisplayObject {
    return new Container(); // playing around with having blank container
  }
  sayHello() {
    console.log("hello from ws");
  }
  renderContainer() {
    this.viewManager.init(this.welcomeView.view);
    this.htmlLayer.renderContent(this.viewManager.view);
  }
}

export default PreGameScene;
