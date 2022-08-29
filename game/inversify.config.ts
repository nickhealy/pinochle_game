import { Container } from "inversify";
import { Application } from "pixi.js";
import Background from "./ui/containers/background/Background";
import HTMLContentLayer from "./ui/containers/HTMLContentLayer/HTMLContentLayer";
import Game from "./ui/game/Game";
import { Manager } from "./ui/Manager";
import ViewManager from "./ui/containers/HTMLContentLayer/HTMLViewManager";
import PreGameScene from "./ui/scenes/preGame/PreGame.scene";
import TYPES from "./inversify-types";
import WelcomeView from "./ui/scenes/preGame/WelcomeView";
import JoinGameView from "./ui/scenes/preGame/JoinGameView";
import EventEmitter from "./ui/events/EventEmitter";
import OwnPeerManager from "./ui/webrtc/OwnPeerManager";
import HostPeerManager from "./ui/webrtc/HostPeerManager";

const main = new Container({ defaultScope: "Singleton" });
main.bind<Game>(TYPES.Game).to(Game);
main.bind<Background>(TYPES.Background).to(Background);
main.bind<PreGameScene>(TYPES.PreGameScene).to(PreGameScene);
main.bind<WelcomeView>(TYPES.WelcomeView).to(WelcomeView);
main.bind<JoinGameView>(TYPES.JoinGameView).to(JoinGameView);
main.bind<Manager>(TYPES.Manager).to(Manager);
main
  .bind<HTMLContentLayer>(TYPES.HtmlContentLayer)
  .toConstantValue(new HTMLContentLayer());
main.bind<EventEmitter>(TYPES.EventEmitter).toConstantValue(new EventEmitter());
main.bind<ViewManager>(TYPES.ViewManager).to(ViewManager);
main
  .bind<OwnPeerManager>(TYPES.OwnPeerManager)
  .to(OwnPeerManager)
  .inSingletonScope();
main
  .bind<HostPeerManager>(TYPES.HostPeerManager)
  .to(HostPeerManager)
  .inSingletonScope();
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
