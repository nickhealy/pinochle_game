import { inject, injectable } from "inversify";
import Peer, { DataConnection } from "peerjs";
import EventEmitter from "../events/EventEmitter";
import { GameplayEvents, LobbyEvents, WebRTCEvents } from "../events/events";
import TYPES from "../../inversify-types";
import WebRTCManager from "./WebRTCManager";
import { StoreType } from "../store";
import { MOCK_OWN_HAND } from "../scenes/game/OwnHand";

enum WebRTCManagerStates {
  INITIAL = "initial",
  READY_TO_CONNECT = "ready_to_connect",
  CONNECTED = "connected",
}

@injectable()
class OwnPeerManager extends WebRTCManager {
  private _ownPeer: Peer | undefined;
  private _eventEmitter: EventEmitter;
  private store: StoreType;
  constructor(
    @inject<EventEmitter>(TYPES.EventEmitter) eventEmitter: EventEmitter,
    @inject<StoreType>(TYPES.Store) store: StoreType
  ) {
    super();
    this._eventEmitter = eventEmitter;
    this.store = store;
  }
  public init() {
    this.addPreGameListeners();
    this.initOwnPeer();
  }

  get peer() {
    return this._ownPeer;
  }

  private initOwnPeer() {
    this._ownPeer = new Peer();
    this._ownPeer.on("open", (id) => {
      this._eventEmitter.emit(WebRTCEvents.OWN_PEER_OPENED, { ownPeerId: id });
    });
    this._ownPeer.on("connection", (conn) => {
      this._connection = conn;
      this._eventEmitter.emit(WebRTCEvents.OWN_PEER_CONNECTED);
      this.addGamePlayListeners.bind(this)();
    });
  }

  private addPreGameListeners() {
    this._eventEmitter.addEventListener(WebRTCEvents.OWN_PEER_OPENED, (e) => {
      // @ts-ignore another error problem
      console.log("own peer opened with event ", e.detail.ownPeerId);
      // @ts-ignore another error problem
      this.store.set("peerId", e.detail.ownPeerId);
      this.state = WebRTCManagerStates.READY_TO_CONNECT;
    });
    this._eventEmitter.addEventListener(WebRTCEvents.OWN_PEER_CONNECTED, () => {
      // @ts-ignore another error problem
      console.log("own peer connected ");
      this.state = WebRTCManagerStates.CONNECTED;
    });
  }

  private addGamePlayListeners() {
    if (!this._connection) {
      console.error("Connection doesn't exist");
      return;
    }

    this._connection.on("data", (ev) => {
      // init game play listeners
      //@ts-ignore
      const { type, data } = JSON.parse(ev);
      switch (type) {
        case "lobby.room_description":
          this._eventEmitter.emit(LobbyEvents.SELF_JOINED_LOBBY, {
            players: data.players,
            ownId: data.own_id,
          });
          break;
        case "lobby.player_join":
          this._eventEmitter.emit(LobbyEvents.PLAYER_JOINED_LOBBY, {
            playerInfo: data.player_info,
          });
          break;
        case "lobby.all_players_connected":
          this._eventEmitter.emit(LobbyEvents.ALL_PLAYERS_CONNECTED);
          break;
        case "lobby.player_teams":
          this.store.set("teams", data.teams);
          this._eventEmitter.emit(LobbyEvents.TEAMS_RECEIVED);
          break;
        case "lobby.game_start":
          this._eventEmitter.emit(LobbyEvents.GAME_START);
          break;
        case "gameplay.pre_play.round_start":
          this._eventEmitter.emit(LobbyEvents.ROUND_START);
          break;
        case "gameplay.player_cards":
          this.store.set("ownHand", data.hand);
          // this.store.set("ownHand", MOCK_OWN_HAND);
          this._eventEmitter.emit(GameplayEvents.OWN_CARDS_RECEIVED);
          break;
        case "gameplay.bid.awaiting_bid":
          this._eventEmitter.emit(GameplayEvents.AWAITING_BID, {
            player: data.player,
          });
          break;
        case "gameplay.bid.player_bid":
          this._eventEmitter.emit(GameplayEvents.PLAYER_BID, {
            player: data.player,
            bid: data.bid,
          });
          break;
        case "gameplay.bid.player_fold":
          this._eventEmitter.emit(GameplayEvents.PASS_BID, {
            player: data.player,
          });
          break;
        case "gameplay.bid.bid_winner":
          this._eventEmitter.emit(GameplayEvents.BID_WINNER, {
            player: data.player,
          });
          break;
        case "gameplay.pre_play.trump_choosing":
          this._eventEmitter.emit(GameplayEvents.TRUMP_CHOOSING, {
            player: data.player,
          });
          break;
        case "gameplay.pre_play.trump_chosen":
          this._eventEmitter.emit(GameplayEvents.TRUMP_CHOSEN, {
            trump: data.trump,
          }); // only emitted when other players choose trump
          break;
        case "gameplay.pre_play.awaiting_melds":
          this._eventEmitter.emit(GameplayEvents.AWAITING_MELDS);
          break;
        case "gameplay.pre_play.player_meld_added":
          this._eventEmitter.emit(GameplayEvents.MELD_ADDED, {
            player: data.player,
            meld: data.meld,
            points: data.points,
          });
          break;
        case "gameplay.pre_play.player_melds_committed":
          this._eventEmitter.emit(GameplayEvents.MELDS_COMMITTED, {
            player: data.player,
          });
          break;
        case "gameplay.pre_play.awaiting_play_start":
          this._eventEmitter.emit(GameplayEvents.AWAITING_PLAY_START);
          break;
        case "gameplay.play.play_start":
          this._eventEmitter.emit(GameplayEvents.PLAY_START);
          break;
        case "gameplay.play.player_turn":
          this._eventEmitter.emit(GameplayEvents.PLAYER_PLAY_TURN, {
            player: data.player,
          });
          break;
        case "gameplay.play.player_play_card":
          this._eventEmitter.emit(GameplayEvents.PLAYER_PLAY_CARD, {
            player: data.player,
            card: data.card,
          });
          break;
        case "gameplay.play.trick_end":
          this._eventEmitter.emit(GameplayEvents.TRICK_END, {
            player: data.player,
            is_last_trick: data.is_last_trick,
            points: data.points,
          });
          break;
        case "gameplay.post_play.round_end":
          this._eventEmitter.emit(GameplayEvents.ROUND_END, {
            score: data.score,
            hasMadeBid: data.has_made_bid,
            gameOver: data.game_over,
          });
          break;
        default:
          console.error("received unknown webrtc event : ", type, { data });
      }
    });
  }
}

export default OwnPeerManager;
