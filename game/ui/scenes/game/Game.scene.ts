import { inject, injectable } from "inversify";
import TYPES from "../../../inversify-types";
import OtherPlayer from "./OtherPlayer";
import OwnHand, { CARD_HEIGHT, CARD_WIDTH } from "./OwnHand";
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
    this._ee.addEventListener(GameplayEvents.TRICK_END, (event) => {
      const OFFTABLE_OFFSET = 50;
      const HALF_VERTICAL = `calc(${this._container.style.height} / 2)`;
      const HALF_HORIZONTAL = `calc(${this._container.style.width} / 2)`;
      // @ts-ignore
      const { player: winningPlayer } = event.detail;

      const $playedCards = Array.from(
        document.querySelectorAll(".card[data-played=true")
      ) as Array<HTMLImageElement>;

      $playedCards.forEach(($el) => {
        const playerIdsXPos = this._store.get("playerIdsByPosition");

        const winningPlayerPos = (
          Object.keys(playerIdsXPos) as Array<OpponentPosition>
        ).find((key) => playerIdsXPos[key] === winningPlayer);

        if (winningPlayer === this._store.get("ownId")) {
          $el.style.top = `calc(100% + ${OFFTABLE_OFFSET}px)`;
          $el.style.left = HALF_HORIZONTAL;
        } else if (winningPlayerPos === "north") {
          $el.style.top = `-${OFFTABLE_OFFSET + CARD_HEIGHT}px`;
          $el.style.left = HALF_HORIZONTAL;
        } else if (winningPlayerPos === "west") {
          $el.style.left = `-${OFFTABLE_OFFSET + CARD_WIDTH}px`;
          $el.style.top = HALF_VERTICAL;
        } else if (winningPlayerPos === "east") {
          $el.style.left = `calc(100% + ${OFFTABLE_OFFSET}px)`;
          $el.style.top = HALF_VERTICAL;
        }

        $el.addEventListener("transitionend", () =>
          $el.parentElement?.removeChild($el)
        );
      });
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
