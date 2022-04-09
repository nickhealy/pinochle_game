import { interpret } from "xstate";
import GameMachine from "../gameplay/machine";

jest.mock("../gameplay/Deck");

describe("GameMachine", () => {
  describe("Bid phase", () => {
    it("handles the bid phase", () => {
      const gameService = interpret(GameMachine);

      gameService.start();

      gameService.send({ type: "BEGIN_GAME" });
      gameService.send({ type: "BID", value: 100 });
      gameService.send({ type: "FOLD", isHez: true });
      gameService.send({ type: "BID", value: 180 });
      gameService.send({ type: "FOLD", isHez: false });
      gameService.send({ type: "FOLD", isHez: false });
      expect(
        gameService.state.matches("game_in_progress.pre_play.awaiting_trump")
      ).toBe(true);
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
});
