import { Container } from "inversify";
import Game from "./ui/game/Game";
import ViewManager from "./ui/containers/HTMLContentLayer/HTMLViewManager";
import PreGameScene from "./ui/scenes/preGame/PreGame.scene";
import TYPES from "./inversify-types";
import WelcomeView from "./ui/scenes/preGame/WelcomeView";
import JoinGameView from "./ui/scenes/preGame/JoinGameView";
import EventEmitter from "./ui/events/EventEmitter";
import OwnPeerManager from "./ui/webrtc/OwnPeerManager";
import HostPeerManager from "./ui/webrtc/HostPeerManager";
import NewGameView from "./ui/scenes/preGame/NewGameView";

const main = new Container({ defaultScope: "Singleton" });
main.bind<Game>(TYPES.Game).to(Game);
main.bind<PreGameScene>(TYPES.PreGameScene).to(PreGameScene);
main.bind<WelcomeView>(TYPES.WelcomeView).to(WelcomeView);
main.bind<JoinGameView>(TYPES.JoinGameView).to(JoinGameView);
main.bind<NewGameView>(TYPES.NewGameView).to(NewGameView);
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

export default main;
