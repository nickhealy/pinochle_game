import { injectable } from "inversify";

@injectable()
class PlayManager {
  _$ownCards: Array<HTMLImageElement> = [];
  _$westCards: Array<HTMLImageElement> = [];
  _$northCards: Array<HTMLImageElement> = [];
  _$eastCards: Array<HTMLImageElement> = [];

  _$playedCardEls: Array<HTMLImageElement> = [];
  constructor() {}

  registerHand(cards: Array<HTMLImageElement>) {
    this._$ownCards = cards;
  }
}

export default PlayManager;
