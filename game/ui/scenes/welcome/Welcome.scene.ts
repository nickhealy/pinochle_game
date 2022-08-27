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
} from "../../containers/HTMLContentLayer/utils";

@injectable()
class WelcomeStage extends Scene {
  private ui: HTMLDivElement;
  private htmlLayer: HTMLContentLayer;
  constructor(
    @inject<Background>(TYPES.Application) app: Application,
    @inject<HTMLContentLayer>(TYPES.HtmlContentLayer)
    htmlLayer: HTMLContentLayer
  ) {
    super(app);
    this.ui = this.createUI();
    this.htmlLayer = htmlLayer;
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
  createBtn(text: string) {
    const btn = createButton(text);
    return btn;
  }
  createBtnContainer() {
    const container = document.createElement("div");
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.flexDirection = "column";
    return container;
  }
  createUI() {
    const container = createCenteredContainer();
    const btnContainer = this.createBtnContainer();
    const joinGameBtn = this.createBtn("Join Existing Game");
    const createGameBtn = this.createBtn("Create New Game");
    btnContainer.appendChild(joinGameBtn);
    btnContainer.appendChild(createGameBtn);
    container.appendChild(btnContainer);
    return container;
  }
  renderContainer() {
    // this.ui.style.height = "100px";
    // this.ui.style.width = "100px";
    // this.ui.style.backgroundColor = "red";
    this.htmlLayer.renderContent(this.ui);
  }
}

export default WelcomeStage;
