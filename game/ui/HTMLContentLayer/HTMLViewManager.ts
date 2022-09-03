import { injectable } from "inversify";
import HTMLView from "./HTMLView";

@injectable()
class HTMLViewManager {
  private _currentView: HTMLView | null = null;
  private _prevView: HTMLView | null = null;

  public init(initialView: HTMLView) {
    this._currentView = initialView;
  }
  public render(target: HTMLView) {
    if (this._currentView) {
      this._prevView = this._currentView;
      this._prevView.destroy();
    }
    this._currentView = target;
    this._currentView.render();
  }

  public goBack() {
    // only supports going back once (stack nav is a bit overkill)
    if (!this._currentView || !this._prevView) {
      throw new Error(
        "no view and/or pre-view currently registered for HTMLViewManager"
      );
    }
    this._currentView.destroy();
    this._currentView = this._prevView;
    this._prevView = null;
    this._currentView.render();
  }
}

export default HTMLViewManager;
