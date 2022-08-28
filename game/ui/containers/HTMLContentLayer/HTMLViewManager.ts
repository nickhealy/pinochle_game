import { injectable } from "inversify";

@injectable()
class HTMLViewManager {
  private _container: HTMLDivElement;
  private _currentView: HTMLDivElement | null = null;
  private _prevView: HTMLDivElement | null = null;
  private _nextView: HTMLDivElement | null = null;

  private createContainer() {
    const container = document.createElement("div");
    container.style.width = "100%";
    container.style.height = "100%";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    return container;
  }
  constructor() {
    this._container = this.createContainer();
  }

  public get view() {
    return this._container;
  }

  public init(initialView: HTMLDivElement) {
    this._currentView = initialView;
    this._container.appendChild(this._currentView);
  }
  private doTransitionUi() {
    // could be extended to include animiations. etc.
    if (this._currentView) {
      this._container.removeChild(this._currentView);
    }
    if (this._nextView) {
      this._container.appendChild(this._nextView);
    }
  }
  public transition(target: HTMLDivElement) {
    this._prevView = this._currentView;
    this._nextView = target;
    this.doTransitionUi();
    this._currentView = this._nextView;
    this._nextView = null;
  }

  public goBack() {
    this._nextView = this._prevView;
    this._prevView = this._currentView;
    this.doTransitionUi();
    this._currentView = this._nextView;
    this._nextView = null;
  }
}

export default HTMLViewManager;
