class HTMLContentLayer {
  private _instance: HTMLElement;
  constructor() {
    this._instance = document.getElementById("html-layer") as HTMLElement;
    this.hideContent();
  }

  public hideContent() {
    this._instance.style.display = "none";
  }

  public renderContent(content: HTMLElement) {
    // will also need to clear previous content, probably
    this._instance.appendChild(content);
    this._instance.style.display = "block";
  }
}

export default HTMLContentLayer;
