import { inject, injectable } from "inversify";
import TYPES from "../../../inversify-types";
import EventEmitter from "../../events/EventEmitter";
import { LobbyEvents } from "../../events/events";
import HTMLView from "../../HTMLContentLayer/HTMLView";
import OwnPeerManager from "../../networking/OwnPeerManager";
import { StoreType } from "../../store";
import WebRTCSansIOClient from "../../networking/WebRTCSansIOClient";

@injectable()
class LobbyView extends HTMLView {
  eventEmitter: EventEmitter;
  store: StoreType;
  ownPeerManager: OwnPeerManager;
  $container: HTMLElement;
  $roomId: HTMLElement;
  $players: Array<HTMLElement>;
  $startGameBtn: HTMLButtonElement;
  constructor(
    @inject<StoreType>(TYPES.Store) store: StoreType,
    @inject<EventEmitter>(TYPES.EventEmitter) eventEmitter: EventEmitter,
    @inject<OwnPeerManager>(TYPES.OwnPeerManager) ownPeerManager: OwnPeerManager
  ) {
    super();
    this.store = store;
    this.ownPeerManager = ownPeerManager;
    this.eventEmitter = eventEmitter;
    this.$container = document.getElementById("lobby-container") as HTMLElement;
    this.$roomId = this.$container.querySelector("#room-id") as HTMLElement;
    this.$players = Array.from(this.$container.querySelectorAll(".player"));
    this.$startGameBtn = this.$container.querySelector(
      "#start-game"
    ) as HTMLButtonElement;

    this.initializeSubscriptions();
    this.addEventListeners();
  }
  initializeSubscriptions() {
    this.store.subscribe("roomId", (id) => {
      this.$roomId.querySelector("span")!.innerText = id;
    });
    this.store.subscribe("players", (players) => {
      this.showPlayersInLobby();
    });
    this.eventEmitter.addEventListener(
      LobbyEvents.SELF_JOINED_LOBBY,
      (event) => {
        // @ts-ignore
        const { players } = event.detail;
        this.store.set("players", players); // could be problems with deep copying, etc. but let's see if that is actually an issue
      }
    );
    this.eventEmitter.addEventListener(
      LobbyEvents.PLAYER_JOINED_LOBBY,
      (event) => {
        // @ts-ignore
        const { playerInfo } = event.detail;
        this.store.set("players", [...this.store.get("players"), playerInfo]);
      }
    );
    this.eventEmitter.addEventListener(
      LobbyEvents.ALL_PLAYERS_CONNECTED,
      () => {
        if (this.store.get("isHost")) {
          this.$startGameBtn.innerText = "Start Game";
          this.$startGameBtn.removeAttribute("disabled");
        } else {
          this.$startGameBtn.innerText = "Waiting for Host to Start";
        }
      }
    );
    this.eventEmitter.addEventListener(LobbyEvents.START_GAME, () => {
      console.log("pressed game start");
      this.ownPeerManager.send(WebRTCSansIOClient.startGame());
    });
  }
  addEventListeners() {
    this.$startGameBtn.addEventListener("click", () =>
      this.eventEmitter.emit(LobbyEvents.START_GAME)
    );
  }

  showPlayersInLobby() {
    const players = this.store.get("players");
    players.forEach((player, idx) => {
      const $name = this.$players[idx].querySelector(
        ".name"
      ) as HTMLSpanElement;
      $name.innerText = player.name;
      $name.classList.remove("invisible");
    });
  }
  renderData() {
    const id = this.store.get("roomId");
    if (id) {
      this.$roomId.querySelector("span")!.innerText = id;
    }
  }
  render(): void {
    this.renderData();
    this.$container.classList.remove("hidden");
  }
  destroy(): void {
    this.$container.classList.add("hidden");
  }
}

export default LobbyView;
