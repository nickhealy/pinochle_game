import enum
from transitions import Machine
from BidPhaseInfo import BidPhaseInfo
from GameScore import game_score
from PlayInfo import play_info
from TurnModel import turn_model


class BidPhaseModel(object):
    def __init__(self, play_info, game_score):
        self.__bid_info = BidPhaseInfo()
        self.__play_info = play_info
        self.__game_score = game_score

    # second param is unused, but transitions requires it to be there
    def handle_bid_winner(self, _):
        winner = self.__bid_info.bid_winner
        winning_bid = self.__bid_info.get_bid_for_player(winner)

        print("[bid_phase]: we have a winner: {}".format(
            winner))
        self.__game_score.set_bid_win_info(
            bid_winner=self.__bid_info.bid_winner, winning_bid=winning_bid)

    def handle_bid_turn_execute(self, event):
        player = event.kwargs.get('player')
        bid = event.kwargs.get('bid')

        if (bid == 'hez'):  # to do: make this configurable (some people dont play with hez's)
            print("[bid_phase]: player {} has hez'd".format(player))
            self.__bid_info.remove_player(player)
        elif (bid == None):
            print("[bid_phase]: player {} has dropped out".format(player))
            self.__bid_info.remove_player(player)
        else:
            self.__bid_info.update_bid(player_id=player, new_bid=bid)
            print("[bid_phase]: player {} has bid {}".format(player, bid))

        if (self.__bid_info.bid_winner):
            self.bid_winner()
            return

        turn_model.next_turn()

    def handle_trump_chosen(self, event):
        chosen_trump = event.kwargs.get('trump')
        print("[bid_phase]: {} has been chosen as the trump suit".format(chosen_trump))
        self.__play_info.set_trump_suit(chosen_trump)


class States(enum.Enum):
    BID_START = 0,
    BID_IN_PROGRESS = 1,
    BID_WON = 2,
    BID_END = 3,


bid_phase_model = BidPhaseModel(play_info=play_info, game_score=game_score)

states = [
    States.BID_START,
    States.BID_IN_PROGRESS,
    States.BID_WON,
    States.BID_END
]

transitions = [
    {'trigger': 'start_bid', 'source': States.BID_START,
        'dest': States.BID_IN_PROGRESS},
    {'trigger': 'bid_turn_execute', 'source': States.BID_IN_PROGRESS, 'dest': None,
        'after': 'handle_bid_turn_execute'},  # internal transition, do not leave state
    {'trigger': 'bid_winner', 'source': States.BID_IN_PROGRESS,
        'dest': States.BID_WON, 'after': 'handle_bid_winner'},
    {'trigger': 'trump_chosen', 'source': States.BID_WON,
        'dest': States.BID_END, 'before': 'handle_trump_chosen'}
]

bid_phase_machine = Machine(
    bid_phase_model,
    states=states,
    initial=States.BID_START,
    auto_transitions=False,
    send_event=True,  # we want to pass data around
    transitions=transitions
)

bid_phase_model.start_bid()
bid_phase_model.bid_turn_execute(player=0, bid='30')
bid_phase_model.bid_turn_execute(player=1, bid='40')
bid_phase_model.bid_turn_execute(player=2, bid='50')
bid_phase_model.bid_turn_execute(player=3, bid=None)
bid_phase_model.bid_turn_execute(player=0, bid='hez')
bid_phase_model.bid_turn_execute(player=1, bid=None)
bid_phase_model.trump_chosen(trump="hearts")
