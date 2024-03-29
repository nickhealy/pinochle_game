import "reflect-metadata";
import { Container } from "inversify";
import * as inversify from "inversify";
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
import OtherPlayer from "./ui/scenes/game/OtherPlayer";
import { FactoryType } from "inversify/lib/utils/factory_type";
import BidPrompt from "./ui/scenes/game/BidPrompt";
import TrumpPrompt from "./ui/scenes/game/TrumpPrompt";
import TrumpContainer from "./ui/scenes/game/TrumpContainer";
import MeldManager from "./ui/scenes/game/MeldManager";
import Score from "./ui/scenes/game/Score";
import StartGameBtn from "./ui/scenes/game/StartGameBtn";

const main = new Container({ defaultScope: "Singleton" });
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
main.bind<OwnPeerManager>(TYPES.OwnPeerManager).to(OwnPeerManager);
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
  .bind<inversify.interfaces.Factory<OtherPlayer>>(TYPES.OtherPlayerFactory)
  .toFactory(() => {
    return (position: OpponentPosition) => {
      return new OtherPlayer(
        position,
        main.get(TYPES.Store),
        main.get(TYPES.EventEmitter)
      );
    };
  });
main.bind<BidPrompt>(TYPES.BidPrompt).to(BidPrompt).inSingletonScope();
main.bind<TrumpPrompt>(TYPES.TrumpPrompt).to(TrumpPrompt).inSingletonScope();
main
  .bind<TrumpContainer>(TYPES.TrumpContainer)
  .to(TrumpContainer)
  .inSingletonScope();
main.bind<MeldManager>(TYPES.MeldManager).to(MeldManager).inSingletonScope();
main.bind<Score>(TYPES.Score).to(Score).inSingletonScope();
main.bind<StartGameBtn>(TYPES.StartGameBtn).to(StartGameBtn).inSingletonScope();
main.bind<GameScene>(TYPES.GameScene).to(GameScene);
main.bind<Game>(TYPES.Game).to(Game);

export default main;
