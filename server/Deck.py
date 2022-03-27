class Card(object):
    def __init__(self, rank, suit, value):
        self.rank = rank
        self.suit = suit
        self.value = value

    def __str__(self):
        return "{}{}".format(self.rank, self.suit.upper()[0])

    def __sub__(self, other):  # for comparing weight of cards
        assert isinstance(other, Card)
        return self.value - other.value


class Deck(object):
    def __init__(self):
        self.__card_registry = {
            '5S': Card('5', 'S', 5),
            '6S': Card('6', 'S', 6),
            '8S': Card('8', 'S', 8),
            '3S': Card('3', 'S', 3)
        }

    def get_card_for_key(self, key):
        return self.__card_registry.get(key)


deck = Deck()
