import functools
from helpers import logging_changes
from InfoBase import InfoBase
from Deck import Card, deck


class Play(object):
    def __init__(self, player, card_key):
        self.player = player
        self.card = deck.get_card_for_key(card_key)

    @property
    def suit(self):
        return self.card.suit

    def __str__(self):
        return "{}({})".format(self.card, self.player)

    def __repr__(self) -> str:
        return str(self)

    def __sub__(self, other):  # for comparing weight of cards
        assert isinstance(other, Play)
        return self.card - other.card


class PlayInfo(InfoBase):
    def __init__(self):
        self.__trump_suit = ''
        self.__player_hands = [['9S', '10D'], [
            'JS', 'QH'], ['AS', '9D'], ['10S', 'AD']]
        self.__current_plays = []
        self.__past_plays = []

    @logging_changes
    def set_trump_suit(self, trump_suit):
        self.__trump_suit = trump_suit

    @logging_changes
    def add_play(self, player, card_id):
        print('adding play {}'.format(card_id))
        new_play = Play(player, card_id)
        self.__player_hands[player].remove(card_id)
        self.__current_plays.append(new_play)

    def __play_is_of_suit(self, target_suit):
        def wrapped_comp(play):
            return play.suit == target_suit
        return wrapped_comp

    def __sort_plays(self, l, r):
        return l.card - r.card

    @logging_changes
    def get_hand_winner(self):
        normal_plays = list(filter(self.__play_is_of_suit(
            self.__current_plays[0].suit), self.__current_plays))
        trump_plays = list(filter(self.__play_is_of_suit(
            self.__trump_suit), self.__current_plays))

        # if there are any trump cards, one of those are guaranteed to win
        possible_winners = trump_plays if len(
            trump_plays) > 0 else normal_plays
        print('possible winners: {}'.format(possible_winners))
        winning_play = sorted(
            possible_winners,
            reverse=True,
            key=functools.cmp_to_key(self.__sort_plays)
        )[0]
        return winning_play.player

    @logging_changes
    def reset_game(self):
        pass

    @property
    def current_plays(self):
        return self.__current_plays

    # def

    def get_state(self):
        return dict({
            "trump": self.__trump_suit,
            "current_plays": self.__current_plays,
            "player_hands": self.__player_hands
        })


play_info = PlayInfo()
