import "reflect-metadata";
import { injectable, inject } from "inversify";
import { Container, Sprite, Application } from "pixi.js";
import TYPES from "../../../inversify-types";

@injectable()
class Background {
  protected app: Application;
  protected bgName: string;
  protected container!: Container;
  protected sprite: Sprite | undefined;
  constructor(@inject<Application>(TYPES.Application) app: Application) {
    this.app = app;
    this.bgName = "green_bg_large";
    this.init();
  }

  get view() {
    return this.container;
  }

  protected init() {
    this.initContainer();
    // note this *may* happen in response to the store
    this.render();
  }

  protected initContainer() {
    this.container = new Container();
    this.container.visible = false;
    this.container.name = "background-container";
    this.container.x = 0;
    this.container.y = 0;
  }

  protected render() {
    // to be replaced with proper asset management class
    this.sprite = Sprite.from(`${this.bgName}.png`);
    this.sprite.x = 0;
    this.sprite.y = 0;
    this.sprite.height = this.container.height;
    this.sprite.width = this.container.width;
    this.sprite.name = "background-sprite";
    this.sprite.scale.set(1);
    this.container.addChild(this.sprite);
    this.app.stage.addChild(this.container);
    this.container.visible = true;
  }
}

export default Background;
