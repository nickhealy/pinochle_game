import { Container } from "inversify";
import Game from "./ui/Game";
import ViewManager from "./ui/HTMLContentLayer/HTMLViewManager";
import PreGameScene from "./ui/scenes/preGame/PreGame.scene";
import TYPES from "./inversify-types";
import WelcomeView from "./ui/scenes/preGame/WelcomeView";
import JoinGameView from "./ui/scenes/preGame/JoinGameView";
import EventEmitter from "./ui/events/EventEmitter";
import OwnPeerManager from "./ui/networking/OwnPeerManager";
import HostPeerManager from "./ui/networking/HostPeerManager";
import NewGameView from "./ui/scenes/preGame/NewGameView";
import ErrorComponent from "./ui/scenes/ErrorComponent";
import EventSourceManager from "./ui/networking/EventSourceManager";
import store from "./ui/store";
import type { StoreType } from "./ui/store";
import LobbyView from "./ui/scenes/lobby/LobbyView";
import lobby, { Lobby } from "./lobby";
import OwnHand from "./ui/scenes/game/OwnHand";
import GameScene from "./ui/scenes/game/Game.scene";
import OtherHand, { OpponentPosition } from "./ui/scenes/game/OtherHand";

const main = new Container({ defaultScope: "Singleton" });
main.bind<Game>(TYPES.Game).to(Game);
main
  .bind<ErrorComponent>(TYPES.ErrorComponent)
  .to(ErrorComponent)
  .inSingletonScope();
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
main
  .bind<EventSourceManager>(TYPES.EventSourceManager)
  .to(EventSourceManager)
  .inSingletonScope();
main.bind<StoreType>(TYPES.Store).toConstantValue(store);
main.bind<LobbyView>(TYPES.LobbyView).to(LobbyView);
main.bind<Lobby>(TYPES.Lobby).toConstantValue(lobby);
main.bind<OwnHand>(TYPES.OwnHand).to(OwnHand).inSingletonScope();
main
  .bind<OtherHand>(TYPES.OtherHandWest)
  .toConstantValue(new OtherHand(OpponentPosition.WEST));
main
  .bind<OtherHand>(TYPES.OtherHandEast)
  .toConstantValue(new OtherHand(OpponentPosition.EAST));
main
  .bind<OtherHand>(TYPES.OtherHandNorth)
  .toConstantValue(new OtherHand(OpponentPosition.NORTH));
main.bind<GameScene>(TYPES.GameScene).to(GameScene);

export default main;
