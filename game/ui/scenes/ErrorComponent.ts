import { injectable } from "inversify";

const DEFAULT_ERROR_MESSAGE = "An error occured";

@injectable()
class ErrorComponent {
  private $container: HTMLElement;
  constructor() {
    this.$container = document.getElementById("error") as HTMLElement;
  }

  showError(message: string = DEFAULT_ERROR_MESSAGE) {
    this.$container.textContent = message;
    this.$container.classList.remove("hidden");
  }

  hide() {
    this.$container.textContent = "";
    this.$container.classList.add("hidden");
  }
}

export default ErrorComponent;
