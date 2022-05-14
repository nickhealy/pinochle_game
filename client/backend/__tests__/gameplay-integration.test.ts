import { mockRandom } from "jest-mock-random";
import waitForExpect from "wait-for-expect";
import { interpret } from "xstate";
import ConnectionSupervisorMachine from "../ConnectionSupervisor/machine";
import { getTestClient } from "../networking/__tests__/mockClient";

jest.mock("../gameplay/Deck");
jest.mock("../networking/webrtc");

describe("integration test", () => {
  beforeAll(() => {
    mockRandom([0.9, 0.7, 0.3, 0.1]);
  });

  it("gameplay", async () => {
    const [player1] = getTestClient();
    const [player2] = getTestClient();
    const [player3] = getTestClient();
    const [player4] = getTestClient();

    const supervisorService = interpret(ConnectionSupervisorMachine);
    supervisorService.start();

    supervisorService.send({
      type: "PLAYER_JOIN_REQUEST",
      connection_info: player1.metadata,
      name: "nick",
    });
    supervisorService.send({
      type: "PLAYER_JOIN_REQUEST",
      connection_info: player2.metadata,
      name: "annabelle",
    });
    supervisorService.send({
      type: "PLAYER_JOIN_REQUEST",
      connection_info: player3.metadata,
      name: "scott",
    });
    supervisorService.send({
      type: "PLAYER_JOIN_REQUEST",
      connection_info: player4.metadata,
      name: "chris",
    });

    await waitForExpect(() => {
      expect(player1.onmessage).toHaveBeenCalledWith(
        JSON.stringify({
          type: "lobby.all_players_connected",
          data: {},
        })
      );
    });

    player1.send(
      JSON.stringify({
        event: "lobby.start_game",
      })
    );

    // getting teams
    await waitForExpect(() => {
      const teams = [
        [player4.id, player2.id],
        [player3.id, player1.id],
      ];
      expect(player1.onmessage).toHaveBeenCalledWith(
        JSON.stringify({
          type: "lobby.player_teams",
          data: {
            teams,
          },
        })
      );
      expect(player2.onmessage).toHaveBeenCalledWith(
        JSON.stringify({
          type: "lobby.player_teams",
          data: {
            teams,
          },
        })
      );
      expect(player3.onmessage).toHaveBeenCalledWith(
        JSON.stringify({
          type: "lobby.player_teams",
          data: {
            teams,
          },
        })
      );
      expect(player4.onmessage).toHaveBeenCalledWith(
        JSON.stringify({
          type: "lobby.player_teams",
          data: {
            teams,
          },
        })
      );
    });

    // game start
    await waitForExpect(() => {
      expect(player1.onmessage).toHaveBeenCalledWith(
        JSON.stringify({
          type: "lobby.game_start",
          data: {},
        })
      );
      expect(player2.onmessage).toHaveBeenCalledWith(
        JSON.stringify({
          type: "lobby.game_start",
          data: {},
        })
      );
      expect(player3.onmessage).toHaveBeenCalledWith(
        JSON.stringify({
          type: "lobby.game_start",
          data: {},
        })
      );
      expect(player4.onmessage).toHaveBeenCalledWith(
        JSON.stringify({
          type: "lobby.game_start",
          data: {},
        })
      );
    });

    // send cards to each player
    await waitForExpect(() => {
      // chris --- 0 , scott -- 1, nick -- 2, annabelle -- 3
      expect(player1.onmessage).toHaveBeenCalledWith(
        JSON.stringify({
          type: "gameplay.player_cards",
          data: {
            hand: [
              "9C",
              "AD",
              "AD",
              "KD",
              "KH",
              "9H",
              "JH",
              "10H",
              "KS",
              "JS",
              "9S",
              "JS",
            ],
          },
        })
      );

      expect(player2.onmessage).toHaveBeenCalledWith(
        JSON.stringify({
          type: "gameplay.player_cards",
          data: {
            hand: [
              "QC",
              "JC",
              "AC",
              "JD",
              "QD",
              "9D",
              "10D",
              "QH",
              "10H",
              "AH",
              "KH",
              "9S",
            ],
          },
        })
      );

      expect(player3.onmessage).toHaveBeenCalledWith(
        JSON.stringify({
          type: "gameplay.player_cards",
          data: {
            hand: [
              "10C",
              "KC",
              "QC",
              "KC",
              "QD",
              "10D",
              "9D",
              "AH",
              "9H",
              "QS",
              "AS",
              "10S",
            ],
          },
        })
      );

      expect(player4.onmessage).toHaveBeenCalledWith(
        JSON.stringify({
          type: "gameplay.player_cards",
          data: {
            hand: [
              "9C",
              "AC",
              "JC",
              "10C",
              "KD",
              "JD",
              "QH",
              "JH",
              "KS",
              "QS",
              "AS",
              "10S",
            ],
          },
        })
      );
    });

    // player @ index 1 (scott's) turn to make a bid
    await waitForExpect(() => {
      expect(player1.onmessage).toHaveBeenCalledWith(
        JSON.stringify({
          type: "gameplay.bid.awaiting_bid",
          data: { player: 1 },
        })
      );
      expect(player2.onmessage).toHaveBeenCalledWith(
        JSON.stringify({
          type: "gameplay.bid.awaiting_bid",
          data: { player: 1 },
        })
      );
      expect(player3.onmessage).toHaveBeenCalledWith(
        JSON.stringify({
          type: "gameplay.bid.awaiting_bid",
          data: { player: 1 },
        })
      );
      expect(player4.onmessage).toHaveBeenCalledWith(
        JSON.stringify({
          type: "gameplay.bid.awaiting_bid",
          data: { player: 1 },
        })
      );
    });
  });

  // scott.send(
  //   JSON.stringify({ event: "gameplay.bid.player_bid", data: { value: 140 } })
  // );

  // to do: maybe reconfigure mocked random to make tests easier to read
  // maybe reset mocks after each assert or something?
  // figure how BE can know which player sent which event

  //   await waitForExpect(() => {
  //     expect(nick.onmessage).toHaveBeenCalledWith(
  //       JSON.stringify({
  //         type: "gameplay.bid.player_bid",
  //         data: { player: 1, bid: 140 },
  //       })
  //     );
  //     expect(annabelle.onmessage).toHaveBeenCalledWith(
  //       JSON.stringify({
  //         type: "gameplay.bid.player_bid",
  //         data: { player: 1, bid: 140 },
  //       })
  //     );
  //     expect(chris.onmessage).toHaveBeenCalledWith(
  //       JSON.stringify({
  //         type: "gameplay.bid.player_bid",
  //         data: { player: 1, bid: 140 },
  //       })
  //     );
  //     // it would be nice to assert that scott didn't receive anything here

  //     // expect(scott.onmessage).toHaveBeenCalledWith(
  //     //   JSON.stringify({
  //     //     type: "gameplay.bid.awaiting_bid",
  //     //     data: { player: 1 },
  //     //   })
  //     // );
  //   });
  // });
});
