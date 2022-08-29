import "reflect-metadata";
import { injectable, inject } from "inversify";
import { Application, DisplayObject } from "pixi.js";
import TYPES from "../../inversify-types";

@injectable()
export abstract class Scene {
  private _sceneDO: DisplayObject;
  protected app: Application;
  constructor(app: Application) {
    this._sceneDO = this.createScene();
    this.app = app;
  }

  render() {
    this.init();
    this.app.stage.addChild(this.sceneDO);
  }

  abstract init(): void;

  abstract createScene(): DisplayObject;

  destroy() {
    this.app.stage.removeChild(this._sceneDO);
    this._sceneDO.destroy();
  }

  private get sceneDO() {
    return this._sceneDO;
  }
}
