from helpers import logging_changes
from InfoBase import InfoBase


class RoundInfo(InfoBase):
    def __init__(self):
        self.__trump_suit = None
        self.__bid = None
        self.__control_team = None
        self.__meld_points = 0
        self.__play_points = 0

    @logging_changes
    def set_trump_suit(self, trump_suit):
        self.__trump_suit = trump_suit

    @logging_changes
    def set_bid_win_info(self, bid_winner, winning_bid):
        self.__control_team = bid_winner
        self.__bid = winning_bid

    def get_state(self):
        return dict({
            "trump": self.__trump_suit,
            "bid": self.__bid,
            "control_team": self.__control_team,
            "meld_points": self.__meld_points,
            "play_points": self.__play_points
        })
