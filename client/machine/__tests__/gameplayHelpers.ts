import { getPlayerTeam } from "../gameplay/GameplayHelpers";

describe("gameplay helpers", () => {
  it("getPlayerTeam", () => {
    let passed = true;
    const model = [0, 1, 0, 1];
    model.forEach((num, idx) => {
      if (getPlayerTeam(idx) !== num) {
        passed = false;
      }
    });
    expect(passed).toBe(true);
  });
});
