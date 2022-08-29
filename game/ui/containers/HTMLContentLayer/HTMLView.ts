import { injectable } from "inversify";

@injectable()
abstract class HTMLView {
  abstract get view(): HTMLDivElement;
}

export default HTMLView;
