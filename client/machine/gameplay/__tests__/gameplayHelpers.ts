import { getPlayerTeam, getWinningPlay } from "../GameplayHelpers";
import { Play } from "../types";

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

  describe("getWinningPlay", () => {
    it("gets winning play all following led suit", () => {
      const plays: Play[] = [
        { key: "9C", player: 0 },
        { key: "10C", player: 1 },
        { key: "JC", player: 2 },
        { key: "QC", player: 3 },
      ];
      expect(getWinningPlay(plays, "hearts")).toEqual({
        key: "10C",
        player: 1,
      });
    });

    it("ignores non-leading suit cards", () => {
      const plays: Play[] = [
        { key: "9C", player: 0 },
        { key: "10C", player: 1 },
        { key: "AS", player: 2 },
        { key: "AD", player: 3 },
      ];
      expect(getWinningPlay(plays, "hearts")).toEqual({
        key: "10C",
        player: 1,
      });
    });

    it("gives preference to first player in tie, non trump", () => {
      const plays: Play[] = [
        { key: "9C", player: 0 },
        { key: "10C", player: 1 },
        { key: "10C", player: 2 },
        { key: "AD", player: 3 },
      ];
      expect(getWinningPlay(plays, "hearts")).toEqual({
        key: "10C",
        player: 1,
      });
    });

    it("gets winning play single trump", () => {
      const plays: Play[] = [
        { key: "9C", player: 0 },
        { key: "10C", player: 1 },
        { key: "9H", player: 2 },
        { key: "QC", player: 3 },
      ];
      expect(getWinningPlay(plays, "hearts")).toEqual({ key: "9H", player: 2 });
    });

    it("gets winning play multiple trump", () => {
      const plays: Play[] = [
        { key: "9C", player: 0 },
        { key: "JH", player: 1 },
        { key: "9H", player: 2 },
        { key: "QC", player: 3 },
      ];
      expect(getWinningPlay(plays, "hearts")).toEqual({ key: "JH", player: 1 });
    });

    it("gives preference to first player in tie, with trump", () => {
      const plays: Play[] = [
        { key: "9C", player: 0 },
        { key: "JH", player: 1 },
        { key: "AH", player: 2 },
        { key: "AH", player: 3 },
      ];
      expect(getWinningPlay(plays, "hearts")).toEqual({ key: "AH", player: 2 });
    });
  });
});
