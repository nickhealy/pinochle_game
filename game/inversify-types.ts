const TYPES = {
  Game: Symbol.for("game"),
  Store: Symbol.for("store"),
  EventEmitter: Symbol.for("event-emitter"),
  Background: Symbol.for("background"),
  PreGameScene: Symbol.for("pregame-scene"),
  WelcomeView: Symbol.for("welcome-view"),
  JoinGameView: Symbol.for("join-game-view"),
  NewGameView: Symbol.for("new-game-view"),
  ViewManager: Symbol.for("view-manager"),
  OwnPeerManager: Symbol.for("own-peer-manager"),
  HostPeerManager: Symbol.for("host-peer-manager"),
};

export default TYPES;
