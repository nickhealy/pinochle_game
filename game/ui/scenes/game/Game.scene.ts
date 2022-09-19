import { inject, injectable } from "inversify";
import TYPES from "../../../inversify-types";
import OtherPlayer from "./OtherPlayer";
import OwnHand from "./OwnHand";
import { OpponentPosition } from "./OtherHand";
import { StoreType } from "../../store";
import EventEmitter from "../../events/EventEmitter";
import { LobbyEvents } from "../../events/events";

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
  constructor(
    @inject<OwnHand>(TYPES.OwnHand) ownHand: OwnHand,
    @inject(TYPES.OtherPlayerFactory)
    otherPlayerFactory: (position: OpponentPosition) => OtherPlayer,
    @inject(TYPES.Store) store: StoreType,
    @inject(TYPES.EventEmitter) ee: EventEmitter
  ) {
    this.ownHand = ownHand;
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
  }

  private assignPlayerIds() {
    let westId, northId, eastId;
    if (this.ownId == null) {
      throw new Error("ownId is not defined");
    }
    const teams = this._store.get("teams");
    // this hard coded for now, this could be a more sophisticated algorithm down the road if we want
    const [ownTeam, otherTeam] = teams.sort((a, b) =>
      a.includes(this.ownId!) ? -1 : 1
    );
    if (ownTeam[0] == this.ownId) {
      northId = ownTeam[1];
      westId = otherTeam[0];
      eastId = otherTeam[1];
    } else {
      northId = ownTeam[0];
      westId = otherTeam[1];
      eastId = otherTeam[0];
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
