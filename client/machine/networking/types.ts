abstract class Connection {
  constructor() {}
  abstract send(data: Record<any, any>): void;
}

export default Connection;
