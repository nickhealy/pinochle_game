from InfoBase import InfoBase
from helpers import logging_changes


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
    def update_game_scores_and_reset(self, plays):
        [team_1_points, team_2_points] = self.__tally_played_points(plays)
        pass

    def __tally_played_points(self, plays):
        team_1_points = 0
        team_2_points = 0

        return [team_1_points, team_2_points]

    def __reset_bid_and_control(self):
        self.__control_team = None
        self.__bid = None

    def get_state(self):
        return dict({
            "bid": None,
            "control_team": None,
            "team_1_points": {
                "meld": 0,
                "play": 0
            },
            "team_2_points": {
                "meld": 0,
                "play": 0
            },
        })


game_score = GameScore()
