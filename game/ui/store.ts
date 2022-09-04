const subs: Record<string | symbol, Array<(...args: any[]) => void>> = {};

interface StoreValTypes {
  roomId: string | null;
  isHost: boolean;
  players: Array<{ id: string; name: string }>;
  peerId: string | null;
}
const _store: StoreValTypes = {
  roomId: null,
  isHost: false,
  players: [],
  peerId: null,
};

const subscribe = <T extends keyof typeof _store>(
  key: T,
  cb: (...args: any[]) => void
) => {
  if (!subs[key]) {
    subs[key] = [];
  }
  subs[key].push(cb);
};

const get = <T extends keyof typeof _store>(key: T) => {
  return _store[key];
};

const set = <T extends keyof typeof _store>(key: T, val: StoreValTypes[T]) => {
  _store[key] = val;
  const cbs = subs[key];
  if (cbs) {
    cbs.forEach((cb) => cb(val));
  }
};

const store = {
  get,
  subscribe,
  set,
};

export type StoreType = typeof store;
export default store;
