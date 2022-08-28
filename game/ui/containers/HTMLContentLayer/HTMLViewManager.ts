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
  private doTransition() {
    console.log("doing transition");
  }
  public transition(target: HTMLDivElement) {
    this._prevView = this._currentView;
    this._nextView = target;
    this.doTransition();
    this._currentView = this._nextView;
    this._nextView = null;
  }
}

export default HTMLViewManager;
