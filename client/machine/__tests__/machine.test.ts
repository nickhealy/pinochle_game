import { interpret } from "xstate";
import GameMachine from "../gameplay/machine";

jest.mock("../gameplay/Deck");

describe("GameMachine", () => {
  describe("Bid phase", () => {
    it("handles the bid phase", () => {
      const gameService = interpret(GameMachine);

      gameService.start();

      gameService.send({ type: "BEGIN_GAME" });
      gameService.send({ type: "FOLD", isHez: true });
      gameService.send({ type: "BID", value: 180 });
      gameService.send({ type: "FOLD", isHez: false });
      gameService.send({ type: "FOLD", isHez: false });
      expect(
        gameService.state.matches("game_in_progress.pre_play.awaiting_trump")
      ).toBe(true);
      const { bids, bidWinner } = gameService.getSnapshot().context.bid;
      expect(bids[bidWinner as number]).toBe(180);
    });

    it("handles everyone passing", () => {
      const gameService = interpret(GameMachine);

      gameService.start();

      gameService.send({ type: "BEGIN_GAME" });
      gameService.send({ type: "CARDS_DEALT" });
      gameService.send({ type: "FOLD", isHez: false });
      gameService.send({ type: "FOLD", isHez: false });
      gameService.send({ type: "FOLD", isHez: false });
      expect(
        gameService.state.matches("game_in_progress.pre_play.awaiting_trump")
      ).toBe(true);
    });
  });

  describe("PrePlay", () => {
    it("winner of bid can select trump", () => {
      const gameService = interpret(GameMachine);

      gameService.start();

      gameService.send({ type: "BEGIN_GAME" });
      gameService.send({ type: "CARDS_DEALT" });
      gameService.send({ type: "BID", value: 100 });
      gameService.send({ type: "FOLD", isHez: true });
      gameService.send({ type: "FOLD", isHez: false });
      gameService.send({ type: "FOLD", isHez: false });
      gameService.send({ type: "TRUMP_CHOSEN", trump: "clubs" });
      expect(
        gameService.state.matches("game_in_progress.pre_play.meld_submission")
      ).toBe(true);
    });

    it("players can submit melds", () => {
      const gameService = interpret(GameMachine);

      gameService.start();

      gameService.send({ type: "BEGIN_GAME" });
      gameService.send({ type: "CARDS_DEALT" });
      gameService.send({ type: "BID", value: 100 });
      gameService.send({ type: "FOLD", isHez: true });
      gameService.send({ type: "FOLD", isHez: false });
      gameService.send({ type: "FOLD", isHez: false });
      gameService.send({ type: "TRUMP_CHOSEN", trump: "clubs" });
      gameService.send({
        type: "SUBMIT_MELDS",
        player: 0,
        melds: [
          {
            type: "royal-marriage",
            cards: ["KC", "QC"],
          },
        ],
      });
      gameService.send({
        type: "SUBMIT_MELDS",
        player: 1,
        melds: [
          {
            type: "pinochle",
            cards: ["QD", "JS"],
          },
        ],
      });
      gameService.send({
        type: "SUBMIT_MELDS",
        player: 2,
        melds: [
          {
            type: "trump-nine",
            cards: ["9C"],
          },
        ],
      });
      gameService.send({
        type: "EDIT_MELD",
        player: 1,
      });
      gameService.send({
        type: "SUBMIT_MELDS",
        player: 3,
        melds: [
          {
            type: "pinochle",
            cards: ["QD", "JS"],
          },
          {
            type: "marriage",
            cards: ["KC", "JC"],
          },
        ],
      });
      gameService.send({
        type: "SUBMIT_MELDS",
        player: 1,
        melds: [
          {
            type: "pinochle",
            cards: ["QD", "JS"],
          },
          {
            type: "four-J",
            cards: ["JC", "JS", "JD", "JH"],
          },
        ],
      });
      gameService.send({ type: "PLAYER_READY" });
      gameService.send({ type: "PLAYER_READY" });
      gameService.send({ type: "PLAYER_READY" });
      gameService.send({ type: "PLAYER_REJECT", player: 2 });
      gameService.send({
        type: "SUBMIT_MELDS",
        player: 2,
        melds: [
          {
            cards: ["9C"],
            type: "trump-nine",
          },
          { cards: ["AC", "AD", "AC", "AS"], type: "four-A" },
        ],
      });

      gameService.send({ type: "PLAYER_READY" });
      gameService.send({ type: "PLAYER_READY" });
      gameService.send({ type: "PLAYER_READY" });
      gameService.send({ type: "PLAYER_READY" });
      expect(gameService.state.matches("game_in_progress.play.pos_a")).toBe(
        true
      );
      const pointsWon = gameService.getSnapshot().context.round.points;
      expect(pointsWon).toEqual([
        [150, 0],
        [140, 0],
      ]);
    });
  });

  describe("Play", () => {
    it("can go through a play phase", () => {
      const gameService = interpret(GameMachine);

      gameService.start();

      gameService.send({ type: "BEGIN_GAME" });
      gameService.send({ type: "CARDS_DEALT" });
      gameService.send({ type: "BID", value: 160 });
      gameService.send({ type: "FOLD", isHez: false });
      gameService.send({ type: "FOLD", isHez: false });
      gameService.send({ type: "FOLD", isHez: false });
      gameService.send({ type: "TRUMP_CHOSEN", trump: "spades" });
      gameService.send({
        type: "SUBMIT_MELDS",
        player: 0,
        melds: [
          { type: "pinochle", cards: ["QS", "JD"] },
          { type: "royal-marriage", cards: ["KS", "QS"] },
        ],
      }); // 80 points
      gameService.send({
        type: "SUBMIT_MELDS",
        player: 1,
        melds: [{ type: "marriage", cards: ["QC", "KC"] }],
      }); // 20 points
      gameService.send({
        type: "SUBMIT_MELDS",
        player: 2,
        melds: [
          { type: "marriage", cards: ["KH", "QH"] },
          { type: "trump-nine", cards: ["9S"] },
        ],
      }); // 30 points
      gameService.send({
        type: "SUBMIT_MELDS",
        player: 3,
        melds: [{ type: "trump-nine", cards: ["9S"] }],
      }); // 10 points
      gameService.send({ type: "PLAYER_READY" });
      gameService.send({ type: "PLAYER_READY" });
      gameService.send({ type: "PLAYER_READY" });
      gameService.send({ type: "PLAYER_READY" });
      expect(gameService.getSnapshot().context.round.points).toEqual([
        [110, 0],
        [30, 0],
      ]);
      // player 0 plays
      gameService.send({ type: "PLAY_CARD", player: 0, key: "AC" }); // winner, 20 points
      gameService.send({ type: "PLAY_CARD", player: 1, key: "QC" });
      gameService.send({ type: "PLAY_CARD", player: 2, key: "QC" });
      gameService.send({ type: "PLAY_CARD", player: 3, key: "9C" });
      expect(gameService.getSnapshot().context.round.points).toEqual([
        [110, 20],
        [30, 0],
      ]);
      // player 0 plays
      gameService.send({ type: "PLAY_CARD", player: 0, key: "AS" }); // winner, 15 points
      gameService.send({ type: "PLAY_CARD", player: 1, key: "QS" });
      gameService.send({ type: "PLAY_CARD", player: 2, key: "9S" });
      gameService.send({ type: "PLAY_CARD", player: 3, key: "9S" });
      expect(gameService.getSnapshot().context.round.points).toEqual([
        [110, 35],
        [30, 0],
      ]);
      // player 0 plays
      gameService.send({ type: "PLAY_CARD", player: 0, key: "QH" });
      gameService.send({ type: "PLAY_CARD", player: 1, key: "AH" }); // winner 30 points
      gameService.send({ type: "PLAY_CARD", player: 2, key: "QH" });
      gameService.send({ type: "PLAY_CARD", player: 3, key: "10H" });
      expect(gameService.getSnapshot().context.round.points).toEqual([
        [110, 35],
        [30, 30],
      ]);
      // player 1 plays
      gameService.send({ type: "PLAY_CARD", player: 1, key: "AS" }); // winner 20 points
      gameService.send({ type: "PLAY_CARD", player: 2, key: "9D" });
      gameService.send({ type: "PLAY_CARD", player: 3, key: "KS" });
      gameService.send({ type: "PLAY_CARD", player: 0, key: "QS" });
      expect(gameService.getSnapshot().context.round.points).toEqual([
        [110, 35],
        [30, 50],
      ]);
      // player 1 plays
      gameService.send({ type: "PLAY_CARD", player: 1, key: "QD" });
      gameService.send({ type: "PLAY_CARD", player: 2, key: "QD" });
      gameService.send({ type: "PLAY_CARD", player: 3, key: "AD" }); // winner 20 points
      gameService.send({ type: "PLAY_CARD", player: 0, key: "JD" });
      expect(gameService.getSnapshot().context.round.points).toEqual([
        [110, 35],
        [30, 70],
      ]);
      // player 3 plays
      gameService.send({ type: "PLAY_CARD", player: 3, key: "AD" }); // winner 25 points
      gameService.send({ type: "PLAY_CARD", player: 0, key: "KD" });
      gameService.send({ type: "PLAY_CARD", player: 1, key: "10D" });
      gameService.send({ type: "PLAY_CARD", player: 2, key: "JD" });
      expect(gameService.getSnapshot().context.round.points).toEqual([
        [110, 35],
        [30, 95],
      ]);
      // player 3 plays
      gameService.send({ type: "PLAY_CARD", player: 3, key: "KH" });
      gameService.send({ type: "PLAY_CARD", player: 0, key: "JH" });
      gameService.send({ type: "PLAY_CARD", player: 1, key: "9H" });
      gameService.send({ type: "PLAY_CARD", player: 2, key: "10H" }); // winner 15 points
      expect(gameService.getSnapshot().context.round.points).toEqual([
        [110, 50],
        [30, 95],
      ]);
      // player 2 plays
      gameService.send({ type: "PLAY_CARD", player: 2, key: "KH" });
      gameService.send({ type: "PLAY_CARD", player: 3, key: "JH" });
      gameService.send({ type: "PLAY_CARD", player: 0, key: "10S" }); // winner 25 points
      gameService.send({ type: "PLAY_CARD", player: 1, key: "10S" });
      expect(gameService.getSnapshot().context.round.points).toEqual([
        [110, 75],
        [30, 95],
      ]);
      // player 0 plays
      gameService.send({ type: "PLAY_CARD", player: 0, key: "9C" });
      gameService.send({ type: "PLAY_CARD", player: 1, key: "10C" });
      gameService.send({ type: "PLAY_CARD", player: 2, key: "AC" });
      gameService.send({ type: "PLAY_CARD", player: 3, key: "JS" }); // winner 20 points
      expect(gameService.getSnapshot().context.round.points).toEqual([
        [110, 75],
        [30, 115],
      ]);
      // player 3 plays
      gameService.send({ type: "PLAY_CARD", player: 3, key: "KD" });
      gameService.send({ type: "PLAY_CARD", player: 0, key: "KS" }); // winner 20 points
      gameService.send({ type: "PLAY_CARD", player: 1, key: "9D" });
      gameService.send({ type: "PLAY_CARD", player: 2, key: "10D" });
      expect(gameService.getSnapshot().context.round.points).toEqual([
        [110, 95],
        [30, 115],
      ]);
      // player 0 plays
      gameService.send({ type: "PLAY_CARD", player: 0, key: "JC" });
      gameService.send({ type: "PLAY_CARD", player: 1, key: "KC" });
      gameService.send({ type: "PLAY_CARD", player: 2, key: "JC" });
      gameService.send({ type: "PLAY_CARD", player: 3, key: "JS" }); // winner 5 points
      expect(gameService.getSnapshot().context.round.points).toEqual([
        [110, 95],
        [30, 120],
      ]);
      // player 3 plays
      gameService.send({ type: "PLAY_CARD", player: 3, key: "9H" });
      gameService.send({ type: "PLAY_CARD", player: 0, key: "10C" });
      gameService.send({ type: "PLAY_CARD", player: 1, key: "KC" });
      gameService.send({ type: "PLAY_CARD", player: 2, key: "AH" }); // winner 35 points
      expect(
        gameService.state.matches("game_in_progress.bid.awaiting_bid")
      ).toBe(true);

      expect(gameService.getSnapshot().context.game.score).toEqual([240, 150]);
      expect(gameService.getSnapshot().context.game.dealer).toEqual(1);
    });
  });
});
