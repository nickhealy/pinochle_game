import enum
from transitions import Machine
from BidPhaseInfo import BidPhaseInfo
from TurnModel import turn_model


class BidPhaseModel(object):
    def __init__(self):
        self.__bid_info = BidPhaseInfo()

    # _event param is unused, but transitions requires it to be there
    def handle_bid_winner(self, _event):
        print("[bid_phase]: we have a winner: {}".format(
            self.__bid_info.bid_winner))

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


class States(enum.Enum):
    BID_START = 0,
    BID_IN_PROGRESS = 1,
    BID_WON = 2,
    BID_END = 3,


bid_phase_model = BidPhaseModel()

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
    {'trigger': 'trump_chosen', 'source': States.BID_WON, 'dest': States.BID_END}
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
# bid_phase_model.bid_turn_execute(player=2, bid='90')
