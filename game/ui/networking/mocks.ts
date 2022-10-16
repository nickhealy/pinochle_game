//@ts-nocheck
import { DataConnection, Peer } from "peerjs";
import { CardKeys, Suit } from "../../backend/gameplay/Deck";
import { MeldType } from "../../backend/gameplay/Meld";
import TYPES from "../../inversify-types";
import main from "../../inversify.config";
import { StoreType } from "../store";
import HostPeerManager from "./HostPeerManager";
import WebRTCSansIOClient from "./WebRTCSansIOClient";

// @ts-ignore
globalThis._useMocks = false;
//@ts-ignore
globalThis.useMocks = (val = true) => {
  //@ts-ignore
  globalThis._useMocks = val;
};

// utility for developing without having to open multiple clients
abstract class MockConnection {
  _listeners: Record<string, Array<(data: string) => void>> = {};
  on(event: string, cb: (data: string) => void) {
    if (!this._listeners[event]) {
      this._listeners[event] = [];
    }
    this._listeners[event].push(cb);
  }

  emit(event: string, eventData: string) {
    const cbs = this._listeners[event];
    if (cbs) {
      cbs.forEach((cb) => cb(eventData));
    }
  }
}

class MockEventSource extends MockConnection {
  get readyState() {
    return EventSource.OPEN;
  }
  get OPEN() {
    return EventSource.OPEN;
  }
  onmessage(e: { data: string }) {
    // noop
    console.log("on message in mock");
  }
}

export const mockEV = new MockEventSource();

class MockPlayer {
  isHost: boolean;
  name: string;
  peer: Peer;
  conn: DataConnection | null = null;
  cards: Array<CardKeys> = [];
  constructor(name: string, isHost: boolean = false) {
    this.name = name;
    this.isHost = isHost;
    this.peer = new Peer();
    this.waitForConnection();
  }
  join() {
    console.log("mock player ", this.name, " joining room");
    mockEV.onmessage({
      data: JSON.stringify({
        event: "player_join_request",
        peer_id: this.isHost
          ? main.get<StoreType>(TYPES.Store).get("peerId")
          : this.peer.id, // ew ew ew
        name: this.name,
      }),
    });
  }

  initializeListeners() {
    if (!this.conn) {
      console.error("NO connection, try again in a second");
      return;
    }
    this.conn.on("data", (ev) => {
      //@ts-ignore
      const { type, data } = JSON.parse(ev);
      console.log(`${this.name} received :`);
      console.dir(ev);

      switch (type) {
        case "gameplay.player_cards":
          this.cards = data.hand;
          break;
        default:
      }
    });
  }

  hand() {
    console.dir(this.cards);
  }

  addMeld(type: MeldType, cards: Array<CardKeys>) {
    this.conn?.send(JSON.stringify(WebRTCSansIOClient.addMeld(cards, type)));
  }

  commitMelds() {
    this.conn?.send(JSON.stringify(WebRTCSansIOClient.submitMelds()));
  }

  waitForConnection() {
    this.peer.on("connection", (conn) => {
      console.log(`${this.name} ready to play mock game`);
      this.conn = conn;
      this.initializeListeners();
    });
  }

  chooseTrump(suit: Suit) {
    this.conn?.send(JSON.stringify(WebRTCSansIOClient.chooseTrump(suit)));
  }

  bid(value: number) {
    this.conn?.send(JSON.stringify(WebRTCSansIOClient.submitBid(value)));
  }

  pass() {
    this.conn?.send(JSON.stringify(WebRTCSansIOClient.passBid()));
  }

  playCard(card: CardKeys) {
    console.log(`PLAYER ${this.name} playing ${card}`);
    if (!this.cards.includes(card)) {
      console.error(`${this.name} does not have ${card}`);
      return;
    }

    this.cards.splice(this.cards.indexOf(card), 1);
    this.conn?.send(JSON.stringify(WebRTCSansIOClient.playCard(card)));
  }
}

// @ts-ignore
globalThis.host = new MockPlayer("nick", true);
// @ts-ignore
globalThis.annabelle = new MockPlayer("annabelle");
// @ts-ignore
globalThis.chris = new MockPlayer("chris");
// @ts-ignore
globalThis.scott = new MockPlayer("scott");

// @ts-ignore
globalThis.joinAllPlayers = () => {
  // HACK ALERT -- THERE IS SOME SORT OF RACE CONDITION IN THE BE
  // THAT GETS TRIGGERED WHEN PEOPLE TRY TO JOIN IN THE SAME EVENT LOOP

  // @ts-ignore
  setTimeout(globalThis.scott.join.bind(globalThis.scott), 0);
  // @ts-ignore
  setTimeout(globalThis.annabelle.join.bind(globalThis.annabelle), 1000);
  // @ts-ignore
  setTimeout(globalThis.chris.join.bind(globalThis.chris), 1500);
};

// @ts-ignore
globalThis.commitAll = () => {
  // @ts-ignore
  globalThis.scott.commitMelds();
  // @ts-ignore
  globalThis.chris.commitMelds();
  // @ts-ignore
  globalThis.annabelle.commitMelds();
};

globalThis.allPass = () => {
  globalThis.annabelle.pass();
  globalThis.chris.pass();
  globalThis.scott.pass();
};

//@ts-ignore
globalThis.goToTrickEnd = () => {
  //@ts-ignore
  globalThis.host.playCard = (cardKey: CardKeys) => {
    const card = document.querySelector(
      `[card-key='${cardKey}']`
    ) as HTMLImageElement;
    if (card) {
      card.click();
    } else {
      console.error(`Could not find ${cardKey} in the DOM`);
    }
  };

  const withTimeout = (cb: () => void) =>
    new Promise((res) => {
      setTimeout(() => {
        cb();
        res();
      }, 1500);
    });

  const host = globalThis.host;
  const annabelle = globalThis.annabelle;
  const chris = globalThis.chris;
  const scott = globalThis.scott;

  withTimeout(() => {
    host.playCard("AS");
    annabelle.playCard("QS");
    chris.playCard("9S");
    scott.playCard("9S");
  })
    .then(() =>
      withTimeout(() => {
        host.playCard("AC");
        annabelle.playCard("QC");
        chris.playCard("QC");
        scott.playCard("9C");
      })
    )
    .then(() =>
      withTimeout(() => {
        host.playCard("QH");
        annabelle.playCard("AH");
        chris.playCard("QH");
        scott.playCard("JH");
      })
    )
    .then(() =>
      withTimeout(() => {
        annabelle.playCard("AS");
        chris.playCard("JC");
        scott.playCard("JS");
        host.playCard("10S");
      })
    )
    .then(() =>
      withTimeout(() => {
        chris.playCard("AC");
        scott.playCard("9H");
        host.playCard("10C");
        annabelle.playCard("KC");
      })
    )
    .then(() =>
      withTimeout(() => {
        chris.playCard("AH");
        scott.playCard("KH");
        host.playCard("JH");
        annabelle.playCard("9H");
      })
    )
    .then(() =>
      withTimeout(() => {
        chris.playCard("10H");
        scott.playCard("10H");
        host.playCard("JC");
        annabelle.playCard("9D");
      })
    )
    .then(() =>
      withTimeout(() => {
        host.playCard("KS");
        annabelle.playCard("10S");
        chris.playCard("JD");
        scott.playCard("KS");
      })
    )
    .then(
      withTimeout(() => {
        annabelle.playCard("QD");
        chris.playCard("10D");
        scott.playCard("AD");
        host.playCard("JD");
      })
    )
    .then(
      withTimeout(() => {
        annabelle.playCard("10C");
        chris.playCard("9D");
        scott.playCard("AD");
        host.playCard("9C");
      })
    )
    .then(
      withTimeout(() => {
        annabelle.playCard("KC");
        chris.playCard("QD");
        scott.playCard("KD");
        host.playCard("QS");
      })
    )
    .then(
      withTimeout(() => {
        annabelle.playCard("10D");
        chris.playCard("KH");
        scott.playCard("JS");
        host.playCard("KD");
      })
    );
};
