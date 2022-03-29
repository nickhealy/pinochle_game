import enum
from functools import reduce
from InfoBase import InfoBase
from TurnModel import States
from helpers import logging_changes


class TeamSides(enum.IntEnum):
    ONE = 0,
    TWO = 1


def get_team_for_player(player):
    if player == States.Pl_0 or player == States.Pl_2:
        return TeamSides.ONE

    return TeamSides.TWO


class GameScore(InfoBase):
    def __init__(self):
        self.__bid = "20"
        self.__control_team = TeamSides.TWO
        self.__points_won = ([0, 0], [0, 0])

    @logging_changes
    def set_bid_and_control(self, bid_winner, winning_bid):
        self.__control_team = bid_winner
        self.__bid = winning_bid

    @logging_changes
    def handle_round_end(self, played_hands, winner):
        played_points = self.__tally_played_points(
            played_hands)

        winning_team_tally = self.__points_won[get_team_for_player(winner)]
        # we only update the points won from play
        winning_team_tally[1] += played_points

        print('[GameScore]: {} has won {} points'.format(
            get_team_for_player(winner), played_points))

    def __tally_played_points(self, plays):
        def add_points(acc, curr):
            return acc + curr.points
        return reduce(add_points, plays, 0)

    def __reset_bid_and_control(self):
        self.__control_team = None
        self.__bid = None

    @logging_changes
    def handle_play_end(self):
        print('[GameScore]: handling play end')
        self.__appraise_winner()
        self.__reset_bid_and_control()

    @logging_changes
    def __appraise_winner(self):
        winning_team = self.__get_winning_team()

        if winning_team is None:
            print("[GameScore]: we have a tie")
            return

        if (self.__do_winning_team_points_exceed_bid(winning_team)):
            print("[GameScore]: {} has exceeded their bid".format(winning_team))
            return

        print("[GameScore]: {} has NOT exceeded their bid".format(winning_team))

    def __do_winning_team_points_exceed_bid(self, winning_team):
        winning_team_points_split = self.__points_won[winning_team]
        return (winning_team_points_split[0] + winning_team_points_split[1]) >= int(self.__bid)
        # return (winning_team_points[0] + winning_team_points[1]) >= self.__bid

    def __get_winning_team(self):
        (team_1_points, team_2_points) = map(
            lambda x: x[0] + x[1], self.__points_won)
        return TeamSides.ONE if team_1_points > team_2_points else TeamSides.TWO if team_2_points > team_1_points else None

    def get_state(self):
        return dict({
            "bid": self.__bid,
            "control_team": self.__control_team,
            "points_won": self.__points_won
        })


game_score = GameScore()
