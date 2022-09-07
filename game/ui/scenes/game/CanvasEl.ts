import { injectable } from "inversify";

@injectable()
abstract class CanvasElement {
  abstract draw(): void;
}

export default CanvasElement;
