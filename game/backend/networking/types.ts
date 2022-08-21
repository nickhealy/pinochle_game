abstract class Connection {
  constructor() {}
  abstract send(data: string): void;
  abstract onmessage(data: string): void;
}

export default Connection;
