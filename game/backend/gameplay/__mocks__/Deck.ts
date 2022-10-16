import { FAKE_ORDER } from "./fakeOrder";

export default {
  ...jest.requireActual("../Deck.ts").default,
  getNewHands: () => FAKE_ORDER,
};
