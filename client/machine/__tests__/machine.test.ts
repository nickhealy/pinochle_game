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
  });
});
