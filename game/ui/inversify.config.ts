import { Container } from "inversify";
import { Application } from "pixi.js";
import Background from "./containers/background/Background";
import HTMLContentLayer from "./containers/HTMLContentLayer/HTMLContentLayer";
import Game from "./game/Game";
import { Manager } from "./Manager";
import ViewManager from "./containers/HTMLContentLayer/HTMLViewManager";
import PreGameScene from "./scenes/welcome/PreGame.scene";
import TYPES from "./types/main";
import WelcomeView from "./scenes/welcome/WelcomeView";

const main = new Container({ defaultScope: "Singleton" });
main.bind<Game>(TYPES.Game).to(Game);
main.bind<Background>(TYPES.Background).to(Background);
main.bind<PreGameScene>(TYPES.PreGameScene).to(PreGameScene);
main.bind<WelcomeView>(TYPES.WelcomeView).to(WelcomeView);
main.bind<Manager>(TYPES.Manager).to(Manager);
main
  .bind<HTMLContentLayer>(TYPES.HtmlContentLayer)
  .toConstantValue(new HTMLContentLayer());
main.bind<ViewManager>(TYPES.ViewManager).to(ViewManager);
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
