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
import TrumpContainer from "./TrumpContainer";
import Score from "./Score";
import StartGameBtn from "./StartGameBtn";

@injectable()
class GameScene {
  private ownHand: OwnHand;

  private otherPlayerWest: OtherPlayer;
  private otherPlayerNorth: OtherPlayer;
  private otherPlayerEast: OtherPlayer;
  private $startGameBtn: StartGameBtn;
  private _container: HTMLDivElement;
  private _store: StoreType;
  private _ee: EventEmitter;
  private ownId: string | null = null;
  private bidPrompt: BidPrompt;
  private trumpPrompt: TrumpPrompt;
  private trumpContainer: TrumpContainer;
  private score: Score;
  constructor(
    @inject<OwnHand>(TYPES.OwnHand) ownHand: OwnHand,
    @inject<BidPrompt>(TYPES.BidPrompt) bidPrompt: BidPrompt,
    @inject<TrumpPrompt>(TYPES.TrumpPrompt) trumpPrompt: TrumpPrompt,
    @inject<TrumpContainer>(TYPES.TrumpContainer)
    trumpContainer: TrumpContainer,
    @inject(TYPES.Score) score: Score,
    @inject(TYPES.StartGameBtn) startGameBtn: StartGameBtn,
    @inject(TYPES.OtherPlayerFactory)
    otherPlayerFactory: (position: OpponentPosition) => OtherPlayer,
    @inject(TYPES.Store) store: StoreType,
    @inject(TYPES.EventEmitter) ee: EventEmitter
  ) {
    this.ownHand = ownHand;
    this.bidPrompt = bidPrompt;
    this.trumpPrompt = trumpPrompt;
    this.trumpContainer = trumpContainer;
    this.$startGameBtn = startGameBtn;
    this.score = score;
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
      // will also show bid winner
      this.bidPrompt.hide();
    });
    this._ee.addEventListener(GameplayEvents.TRUMP_CHOOSING, (event) => {
      // @ts-ignore lol
      const { player } = event.detail;
      if (player !== this.ownId) {
        this.trumpPrompt.hide();
      } else {
        this.trumpPrompt.render();
      }
    });
    this._ee.addEventListener(GameplayEvents.AWAITING_MELDS, () => {
      this.trumpPrompt.hide();
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

    this._store.set("playerIdsByPosition", {
      north: northId,
      west: westId,
      east: eastId,
    });
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
