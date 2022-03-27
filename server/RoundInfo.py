from helpers import logging_changes
from InfoBase import InfoBase
from Deck import Card


class Play(object):
    def __init__(self, player, card_key):
        self.player = player
        self.card = card_key

    def __str__(self):
        return "{}({})".format(self.card, self.player)

    def __repr__(self) -> str:
        return str(self)


class RoundInfo(InfoBase):
    def __init__(self):
        self.__trump_suit = None
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
        self.__player_hands = [['AS', '2D'], [
            '3C', '5H'], ['4D', 'JD'], ['AC', '10D']]
        self.__current_play = []
        self.__past_plays = []

    @logging_changes
    def set_trump_suit(self, trump_suit):
        self.__trump_suit = trump_suit

    @logging_changes
    def set_bid_win_info(self, bid_winner, winning_bid):
        self.__control_team = bid_winner
        self.__bid = winning_bid

    @logging_changes
    def add_play(self, player, card_id):
        new_play = Play(player, card_id)
        self.__player_hands[player].remove(card_id)
        self.__current_play.append(new_play)

    def get_state(self):
        return dict({
            "trump": self.__trump_suit,
            "bid": self.__bid,
            "control_team": self.__control_team,
            "team_1_points": self.__team_1_points,
            "team_2_points": self.__team_2_points,
            "current_play": self.__current_play,
            "player_hands": self.__player_hands
        })


round_info = RoundInfo()
