import { interpret } from "xstate";
import GameMachine from "../gameplay/machine";

describe("GameMachine", () => {
  describe("Bid phase", () => {
    it("correctly handles the bid phase", (done) => {
      const gameService = interpret(GameMachine).onTransition((state) => {
        if (state.matches("game_in_progress.pre_play.awaiting_trump")) {
          done();
        }
      });

      gameService.start();

      gameService.send({ type: "BEGIN_GAME" });
      gameService.send({ type: "CARDS_DEALT" });
      gameService.send({ type: "BID", value: 100 });
      gameService.send({ type: "FOLD", isHez: true });
      gameService.send({ type: "BID", value: 180 });
      gameService.send({ type: "FOLD", isHez: false });
      gameService.send({ type: "FOLD", isHez: false });
    });
  });
});
