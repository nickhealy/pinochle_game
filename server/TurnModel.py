import enum
from transitions import Machine


class TurnModel(object):
    def on_enter_Pl_1(self):
        print("turn model Player 1's turn")

    def on_enter_Pl_2(self):
        print("turn model Player 2's turn")

    def on_enter_Pl_3(self):
        print("turn model Player 3's turn")

    def on_enter_Pl_4(self):
        print("turn model Player 4's turn")
    pass


class States(enum.Enum):
    Pl_1 = 0,
    Pl_2 = 1,
    Pl_3 = 2,
    Pl_4 = 3


turn_model = TurnModel()

states = [States.Pl_1, States.Pl_2, States.Pl_3, States.Pl_4]

transitions = [
    {'trigger': 'next_turn', 'source': States.Pl_1, 'dest': States.Pl_2},
    {'trigger': 'next_turn', 'source': States.Pl_2, 'dest': States.Pl_3},
    {'trigger': 'next_turn', 'source': States.Pl_3, 'dest': States.Pl_4},
    {'trigger': 'next_turn', 'source': States.Pl_4, 'dest': States.Pl_1},
    {'trigger': 'to_Pl_1', 'source': '*', 'dest': States.Pl_1},
    {'trigger': 'to_Pl_2', 'source': '*', 'dest': States.Pl_2},
    {'trigger': 'to_Pl_3', 'source': '*', 'dest': States.Pl_3},
    {'trigger': 'to_Pl_4', 'source': '*', 'dest': States.Pl_4}
]

turn_machine = Machine(turn_model, states=states,
                       transitions=transitions, initial=States.Pl_1, auto_transitions=False)
