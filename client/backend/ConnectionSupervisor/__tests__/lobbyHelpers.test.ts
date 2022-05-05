import { shuffleConnectedWorkers } from "../lobbyHelpers";
import { mockRandom, resetMockRandom } from "jest-mock-random";

describe("lobbyHelpers", () => {
  describe("shuffleConnectedWorkers", () => {
    it("fully populates array with workers", () => {
      const mockWorkers = [1, 2, 3, 4];
      // @ts-expect-error it is not important that these are actually workers for the test
      const shuffled = shuffleConnectedWorkers(mockWorkers);
      expect(shuffled.filter((sh) => sh !== null).length).toBe(4);
    });

    it("populates array based on output of random number", () => {
      mockRandom([0.9, 0.7, 0.3, 0.1]);
      const mockWorkers = [1, 2, 3, 4];
      // @ts-expect-error it is not important that these are actually workers for the test
      const shuffled = shuffleConnectedWorkers(mockWorkers);
      expect(shuffled.filter((sh) => sh !== null).length).toBe(4);
    });
  });
});
