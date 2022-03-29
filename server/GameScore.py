from functools import reduce
import enum
from InfoBase import InfoBase
from TurnModel import States
from helpers import logging_changes


class TeamSides(enum.Enum):
    ONE = 0,
    TWO = 1


def get_team_for_player(player):
    if player == States.Pl_0 or player == States.Pl_2:
        return TeamSides.ONE

    return TeamSides.TWO


class GameScore(InfoBase):
    def __init__(self):
        self.__bid = None
        self.__control_team = None
        self.__team_1_points = {
            "meld": 0,
            "play": 0
        }
        self.__team_2_points = {
            "meld": 0,
            "play": 0
        }

    @logging_changes
    def set_bid_win_info(self, bid_winner, winning_bid):
        self.__control_team = bid_winner
        self.__bid = winning_bid

    @logging_changes
    def handle_round_end(self, played_hands, winner):
        played_points = self.__tally_played_points(
            played_hands)

        if get_team_for_player(winner) is TeamSides.ONE:
            self.__team_1_points["play"] += played_points
        else:
            self.__team_2_points["play"] += played_points

        print('[GameScore]: {} has won {} points'.format(
            get_team_for_player(winner), played_points))
        self.__reset_bid_and_control()

    def __tally_played_points(self, plays):
        def add_points(acc, curr):
            return acc + curr.points
        return reduce(add_points, plays, 0)

    def __reset_bid_and_control(self):
        self.__control_team = None
        self.__bid = None

    def get_state(self):
        return dict({
            "bid": None,
            "control_team": None,
            "team_1_points": self.__team_1_points,
            "team_2_points": self.__team_2_points
        })


game_score = GameScore()
