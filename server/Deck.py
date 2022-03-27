class Card(object):
    def __init__(self, rank, suit, value):
        self.rank = rank
        self.suit = suit
        self.value = value

    def __str__(self):
        return "{}{}".format(self.rank, self.suit.upper()[0])
