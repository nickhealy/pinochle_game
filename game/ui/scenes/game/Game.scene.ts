import { inject, injectable } from "inversify";
import TYPES from "../../../inversify-types";
import OtherPlayer from "./OtherPlayer";
import OwnHand from "./OwnHand";
import { OpponentPosition } from "./OtherHand";
import { StoreType } from "../../store";
import EventEmitter from "../../events/EventEmitter";
import { GameplayEvents, LobbyEvents } from "../../events/events";
import BidPrompt from "./BidPrompt";
import TrumpPrompt from "./TrumpPrompt";

@injectable()
class GameScene {
  private ownHand: OwnHand;

  private otherPlayerWest: OtherPlayer;
  private otherPlayerNorth: OtherPlayer;
  private otherPlayerEast: OtherPlayer;
  private _container: HTMLDivElement;
  private _store: StoreType;
  private _ee: EventEmitter;
  private ownId: string | null = null;
  private bidPrompt: BidPrompt;
  private trumpPrompt: TrumpPrompt;
  constructor(
    @inject<OwnHand>(TYPES.OwnHand) ownHand: OwnHand,
    @inject<BidPrompt>(TYPES.BidPrompt) bidPrompt: BidPrompt,
    @inject<TrumpPrompt>(TYPES.TrumpPrompt) trumpPrompt: TrumpPrompt,
    @inject(TYPES.OtherPlayerFactory)
    otherPlayerFactory: (position: OpponentPosition) => OtherPlayer,
    @inject(TYPES.Store) store: StoreType,
    @inject(TYPES.EventEmitter) ee: EventEmitter
  ) {
    this.ownHand = ownHand;
    this.bidPrompt = bidPrompt;
    this.trumpPrompt = trumpPrompt;
    this.otherPlayerWest = otherPlayerFactory(OpponentPosition.WEST);
    this.otherPlayerNorth = otherPlayerFactory(OpponentPosition.NORTH);
    this.otherPlayerEast = otherPlayerFactory(OpponentPosition.EAST);
    this._container = document.getElementById(
      "gameplay-container"
    ) as HTMLDivElement;
    this._store = store;
    this._ee = ee;

    this.initializeSubscriptions();
  }

  private initializeSubscriptions() {
    this._store.subscribe("ownId", (id) => {
      this.ownId = id;
    });
    this._ee.addEventListener(LobbyEvents.TEAMS_RECEIVED, () => {
      this.assignPlayerIds();
    });
    this._ee.addEventListener(GameplayEvents.AWAITING_BID, (event) => {
      // @ts-ignore using typescript was a mistake
      const { player } = event.detail;
      if (player !== this.ownId) {
        this.bidPrompt.hide();
      } else {
        this.bidPrompt.render();
      }
    });
    this._ee.addEventListener(GameplayEvents.BID_WINNER, (event) => {
      console.log("hiding bid");
      // will also show bid winner
      this.bidPrompt.hide();
    });
    this._ee.addEventListener(GameplayEvents.TRUMP_CHOOSING, (event) => {
      console.log("trump choosing");
      // @ts-ignore lol
      const { player } = event.detail;
      if (player !== this.ownId) {
        this.trumpPrompt.hide();
      } else {
        this.trumpPrompt.render();
      }
    });
  }

  private assignPlayerIds() {
    let westId, northId, eastId;
    if (this.ownId == null) {
      throw new Error("ownId is not defined");
    }
    const teams = this._store.get("teams");

    if (teams[0][0] == this.ownId) {
      northId = teams[0][1];
      westId = teams[1][0];
      eastId = teams[1][1];
    } else if (teams[0][1] == this.ownId) {
      northId = teams[0][0];
      westId = teams[1][1];
      eastId = teams[1][0];
    } else if (teams[1][0] == this.ownId) {
      northId = teams[1][1];
      westId = teams[0][1];
      eastId = teams[0][0];
    } else {
      northId = teams[1][0];
      westId = teams[0][0];
      eastId = teams[0][1];
    }

    this.otherPlayerWest.assignId(westId);
    this.otherPlayerNorth.assignId(northId);
    this.otherPlayerEast.assignId(eastId);
  }

  render() {
    this._container.classList.remove("hidden");
    this.ownHand.render();
    this.otherPlayerWest.render();
    this.otherPlayerNorth.render();
    this.otherPlayerEast.render();
  }
}

export default GameScene;
