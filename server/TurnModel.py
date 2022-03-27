import enum
from transitions import Machine


class TurnModel(object):
    def log_next_turn(self):
        print("[turn model]: now {}'s turn".format(self.state))
    pass


class States(enum.Enum):
    Pl_0 = 0,
    Pl_1 = 1,
    Pl_2 = 2,
    Pl_3 = 3


turn_model = TurnModel()

states = [States.Pl_0, States.Pl_1, States.Pl_2, States.Pl_3]

transitions = [
    {'trigger': 'next_turn', 'source': States.Pl_0, 'dest': States.Pl_1},
    {'trigger': 'next_turn', 'source': States.Pl_1, 'dest': States.Pl_2},
    {'trigger': 'next_turn', 'source': States.Pl_2, 'dest': States.Pl_3},
    {'trigger': 'next_turn', 'source': States.Pl_3, 'dest': States.Pl_0},
    {'trigger': 'to_Pl_0', 'source': '*', 'dest': States.Pl_0},
    {'trigger': 'to_Pl_1', 'source': '*', 'dest': States.Pl_1},
    {'trigger': 'to_Pl_2', 'source': '*', 'dest': States.Pl_2},
    {'trigger': 'to_Pl_3', 'source': '*', 'dest': States.Pl_3}
]

turn_machine = Machine(
    turn_model,
    states=states,
    transitions=transitions,
    initial=States.Pl_0,
    auto_transitions=False,
    after_state_change='log_next_turn'
)
