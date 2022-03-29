class Card(object):
    def __init__(self, rank, suit, value, points):
        self.rank = rank
        self.suit = suit
        self.value = value
        self.points = points

    def __str__(self):
        return "{}{}".format(self.rank, self.suit.upper()[0])

    def __sub__(self, other):  # for comparing weight of cards
        assert isinstance(other, Card)
        return self.value - other.value

    def __repr__(self) -> str:
        return 'Card({}{})'.format(self.rank, self.suit)


CARD_RANK_VALUE_POINTS = [
    ('9', 1, 0), ('J', 2, 0), ('Q', 3, 5), ('K', 4, 5), ('10', 5, 10), ('A', 6, 10)]
CARD_SUITS = ['H', 'C', 'S', 'D']


class Deck(object):
    def __init__(self):
        self.__card_registry = self.__gen_card_registry()

  # generates a deck (for readability's sake)
    def __gen_card_registry(self):
        registry = {}
        for rank, value, points in CARD_RANK_VALUE_POINTS:
            for suit in CARD_SUITS:
                card = Card(rank, suit, value, points)
                card_id = str(card)
                registry[card_id] = card
        return registry

    def get_card_for_key(self, key):
        return self.__card_registry.get(key)


deck = Deck()
