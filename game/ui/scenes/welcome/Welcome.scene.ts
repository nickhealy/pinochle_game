import "reflect-metadata";
import { injectable, inject } from "inversify";
import Background from "../../containers/background/Background";
import TYPES from "../../types/main";
import { Scene } from "../Scene";
import { Application, DisplayObject, Container } from "pixi.js";

@injectable()
class WelcomeStage extends Scene {
  constructor(@inject<Background>(TYPES.Application) app: Application) {
    super(app);
  }
  setup() {}
  createScene(): DisplayObject {
    return new Container(); // playing around with having blank container
  }
  sayHello() {
    console.log("hello from ws");
  }
}

export default WelcomeStage;
