import { inject, injectable } from "inversify";
import TYPES from "../../../inversify-types";
import EventEmitter from "../../events/EventEmitter";
import { GameplayEvents } from "../../events/events";
import OwnPeerManager from "../../networking/OwnPeerManager";
import WebRTCSansIOClient from "../../networking/WebRTCSansIOClient";

const BID_INCREMENT = 10;
const BASE_BID = 100;

@injectable()
class BidPrompt {
  _$container: HTMLDivElement;
  $increaseBidBtn: HTMLButtonElement;
  $decreaseBidBtn: HTMLButtonElement;
  $passBtn: HTMLButtonElement;
  $submitBtn: HTMLButtonElement;
  bidVal: number = BASE_BID;
  _ownPeerManager: OwnPeerManager;
  _ee: EventEmitter;
  constructor(
    @inject<OwnPeerManager>(TYPES.OwnPeerManager)
    ownPeerManager: OwnPeerManager,
    @inject<EventEmitter>(TYPES.EventEmitter) ee: EventEmitter
  ) {
    this._$container = document.getElementById("bid-prompt") as HTMLDivElement;
    this.$increaseBidBtn = document.getElementById(
      "inc-bid"
    ) as HTMLButtonElement;
    this.$decreaseBidBtn = document.getElementById(
      "dec-bid"
    ) as HTMLButtonElement;
    this.$passBtn = document.getElementById("pass-bid") as HTMLButtonElement;
    this.$submitBtn = document.getElementById(
      "submit-bid"
    ) as HTMLButtonElement;
    this._ownPeerManager = ownPeerManager;
    this._ee = ee;

    this.addClickListeners();
    this.addEventListeners();
  }

  private _renderBidVal() {
    this.$submitBtn.innerHTML = `Bid: <span id="bid-val">${this.bidVal}</span>`;
  }

  private increaseBid() {
    this.bidVal += BID_INCREMENT;
    this._renderBidVal();
  }

  private decreaseBid() {
    this.bidVal -= BID_INCREMENT;
    this._renderBidVal();
  }

  private addClickListeners() {
    this.$increaseBidBtn.addEventListener("click", this.increaseBid.bind(this));
    this.$decreaseBidBtn.addEventListener("click", this.decreaseBid.bind(this));
    this.$submitBtn.addEventListener("click", this.submitBid.bind(this));
  }

  private addEventListeners() {
    this._ee.addEventListener(GameplayEvents.PLAYER_BID, (event) => {
      // @ts-ignore lol
      const { bid } = event.detail;
      this.bidVal = bid;
    });
  }

  private submitBid() {
    // hack for UI
    // this.$submitBtn.classList.add("disabled");
    this._ownPeerManager.send(WebRTCSansIOClient.submitBid(this.bidVal));
  }

  render() {
    this._renderBidVal();
    this._$container.classList.remove("hidden");
  }

  hide() {
    this._$container.classList.add("hidden");
  }
}

export default BidPrompt;
