import { Container } from "inversify";
import { Application } from "pixi.js";
import Background from "./containers/background/Background";
import HTMLContentLayer from "./containers/HTMLContentLayer/HTMLContentLayer";
import Game from "./game/Game";
import { Manager } from "./Manager";
import WelcomeStage from "./scenes/welcome/Welcome.scene";
import TYPES from "./types/main";

const main = new Container({ defaultScope: "Singleton" });
main.bind<Game>(TYPES.Game).to(Game);
main.bind<Background>(TYPES.Background).to(Background);
main.bind<WelcomeStage>(TYPES.WelcomeStage).to(WelcomeStage);
main.bind<Manager>(TYPES.Manager).to(Manager);
main
  .bind<HTMLContentLayer>(TYPES.HtmlContentLayer)
  .toConstantValue(new HTMLContentLayer());
main.bind<Application>(TYPES.Application).toConstantValue(
  new Application({
    view: document.getElementById("pixi-canvas") as HTMLCanvasElement,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
    backgroundColor: 0x008800,
    height: window.innerHeight,
    width: window.innerWidth,
  })
);

export default main;
