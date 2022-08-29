import { injectable } from "inversify";
import { PreGameUIEvents } from "../../scenes/preGame/PreGame.scene";
export type Dispatch = (event: PreGameUIEvents) => void;

@injectable()
abstract class HTMLView {
  private _dispatch!: Dispatch;
  abstract get view(): HTMLDivElement;
  registerDispatch(dispatch: Dispatch) {
    this._dispatch = dispatch;
  }
  protected get dispatch() {
    return this._dispatch;
  }
}

export default HTMLView;
