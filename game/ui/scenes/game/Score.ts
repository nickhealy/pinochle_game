import { inject, injectable } from "inversify";
import TYPES from "../../../inversify-types";
import EventEmitter from "../../events/EventEmitter";
import { GameplayEvents, LobbyEvents } from "../../events/events";
import { StoreType } from "../../store";

const ROUND_BID_VAL_SELECTOR = "#bid>.round-score-value";
const ROUND_PLAY_VAL_SELECTOR = "#play>.round-score-value";

@injectable()
class Score {
  _$container: HTMLDivElement;
  ee: EventEmitter;
  store: StoreType;
  bids: Array<number> = [0, 0];
  _meldPoints: Array<number> = [0, 0];
  constructor(
    @inject(TYPES.EventEmitter) ee: EventEmitter,
    @inject(TYPES.Store) store: StoreType
  ) {
    this._$container = document.getElementById(
      "score-container"
    ) as HTMLDivElement;
    this.ee = ee;
    this.store = store;

    this.initializeListeners();
  }

  _updateMeldPoints(newMelds: Array<number>) {
    this._meldPoints = newMelds;
    Array.from(
      this._$container.querySelectorAll("#meld > .round-score-value")
    ).forEach(($el, idx) => ($el.innerHTML = `${this._meldPoints[idx]}`));
  }

  _getTeamIdx(playerId: string) {
    const teams = this.store.get("teams");
    return teams.findIndex((team) => team.includes(playerId));
  }

  _tallyTeamBid(playerId: string, bid: number) {
    this.bids[this._getTeamIdx(playerId)] += bid;
  }

  initializeListeners() {
    this.ee.addEventListener(LobbyEvents.ROUND_START, this.render.bind(this));
    this.ee.addEventListener(
      LobbyEvents.TEAMS_RECEIVED,
      this.populateTeams.bind(this)
    );
    this.ee.addEventListener(GameplayEvents.OWN_BID, (e) => {
      // @ts-ignore
      const { bid } = e.detail;
      const ownId = this.store.get("ownId");
      if (ownId) {
        this._tallyTeamBid(ownId, bid);
      }
    });
    this.ee.addEventListener(GameplayEvents.PLAYER_BID, (e) => {
      // @ts-ignore
      const { bid, player } = e.detail;
      this._tallyTeamBid(player, bid);
    });
    this.ee.addEventListener(GameplayEvents.BID_WINNER, (e) => {
      // @ts-ignore
      const { player } = e.detail;
      const $bidEls = Array.from(
        this._$container.querySelectorAll(ROUND_BID_VAL_SELECTOR)
      );
      const winnerTeamIdx = this._getTeamIdx(player);
      $bidEls[winnerTeamIdx].innerHTML = `${this.bids[winnerTeamIdx]}`;
    });
    this.ee.addEventListener(GameplayEvents.MELD_ADDED, (e) => {
      // @ts-ignore
      const { points } = e.detail;
      this._updateMeldPoints([points[0][0], points[1][0]]); // first entry of each idx is meld points
    });
    this.ee.addEventListener(GameplayEvents.ADD_MELD, (e) => {
      const {
        points,
        // @ts-ignore
      } = e.detail;
      const ownId = this.store.get("ownId");
      if (ownId) {
        const newMeldPoints = this._meldPoints;
        newMeldPoints[this._getTeamIdx(ownId)] += points;
        this._updateMeldPoints(newMeldPoints);
      }
    });
    this.ee.addEventListener(
      GameplayEvents.PLAY_START,
      this.initPlayScore.bind(this)
    );
  }

  _getPlayerName(id: string) {
    const players = this.store.get("players");
    const player = players.find((player) => player.id == id);
    return (player && player.name) || "";
  }

  populateTeams() {
    const [[player0, player2], [player1, player3]] = this.store.get("teams");
    const playerIds = [player0, player2, player1, player3];
    Array.from(this._$container.querySelectorAll(".player-score-name")).forEach(
      ($name, idx) => ($name.innerHTML = this._getPlayerName(playerIds[idx]))
    );
  }

  zeroOutScore() {
    const $bidEls = Array.from(
      this._$container.querySelectorAll(ROUND_BID_VAL_SELECTOR)
    );
    $bidEls.forEach(($el) => ($el.innerHTML = "--"));
  }

  initPlayScore() {
    const $playScoreEls = Array.from(
      this._$container.querySelectorAll(ROUND_PLAY_VAL_SELECTOR)
    );
    $playScoreEls.forEach(($el) => ($el.innerHTML = `0`));
  }

  render() {
    this.zeroOutScore();
    this.populateTeams();
    this._$container.classList.remove("hidden");
  }
}

export default Score;
