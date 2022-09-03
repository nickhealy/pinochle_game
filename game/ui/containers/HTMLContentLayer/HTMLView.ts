import { injectable } from "inversify";

@injectable()
abstract class HTMLView {
  abstract render(): void;
  abstract destroy(): void;
}

export default HTMLView;
