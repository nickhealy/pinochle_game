import "reflect-metadata";
import { injectable, decorate } from "inversify";
import { AllEvents } from "./events";

decorate(injectable(), EventTarget); // need to do this in order to inject derived class

@injectable()
class EventEmitter extends EventTarget {
  constructor() {
    super();
  }

  emit(eventType: AllEvents, payload: Record<string, any> = {}) {
    // @ts-ignore
    const event = new CustomEvent(eventType, { detail: payload });
    console.log("Emitting event: ", {
      type: event.type,
      event,
      payload: event.detail,
    });
    this.dispatchEvent(event);
  }
}

export default EventEmitter;
