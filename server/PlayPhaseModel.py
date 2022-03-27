from TurnModel import turn_model
import enum
from transitions import Machine
import random


count = 0


class PlayPhaseModel(object):
    def on_exit_PLAY_START(self):
        print("starting the play")

    def on_enter_POS_A(self):
        print("Moving to POS_A, beginning of round {}".format(count + 1))

    def log_new_position(self):
        print("play now at position {}".format(self.state))

    def on_enter_PLAY_END(self):
        print("play has ended")

    def on_enter_ROUND_END(self):
        print('round has ended')
        if (self.is_play_over):
            print('play is over, ending play')
            self.play_end()
            return

        winner = random.randint(0, 3)
        print('winner has been chosen to be {}, they will now start'.format(winner + 1))
        [
            turn_model.to_Pl_0,
            turn_model.to_Pl_1,
            turn_model.to_Pl_2,
            turn_model.to_Pl_3
        ][winner]()
        self.new_round()

    def handle_played_card(self):
        print("{} just played a card".format(turn_model.state))
        turn_model.next_turn()

    @property
    def is_play_over(self):
        global count
        count += 1
        return count >= 3
    pass


class States(enum.Enum):
    PLAY_START = 0,
    POS_A = 1,
    POS_B = 2,
    POS_C = 3,
    POS_D = 4,
    ROUND_END = 5,
    PLAY_END = 6,


play_phase_model = PlayPhaseModel()

states = [
    States.PLAY_START,
    States.POS_A,
    States.POS_B,
    States.POS_C,
    States.POS_D,
    States.ROUND_END,
    States.PLAY_END
]

transitions = [
    {'trigger': 'new_round', 'source': [
        States.PLAY_START, States.ROUND_END], 'dest': States.POS_A},
    {'trigger': 'play_card', 'source': States.POS_A,
        'dest': States.POS_B, 'after': 'handle_played_card'},
    {'trigger': 'play_card', 'source': States.POS_B,
        'dest': States.POS_C, 'after': 'handle_played_card'},
    {'trigger': 'play_card', 'source': States.POS_C,
        'dest': States.POS_D, 'after': 'handle_played_card'},
    {'trigger': 'play_card', 'source': States.POS_D,
        'dest': States.ROUND_END, 'after': 'handle_played_card'},
    {'trigger': 'play_end', 'source': States.ROUND_END,
        'dest': States.PLAY_END},
]

play_phase_machine = Machine(
    play_phase_model,
    states=states,
    transitions=transitions,
    initial=States.PLAY_START,
    auto_transitions=False,
    queued=True,
    after_state_change='log_new_position'
)


# play_phase_model.new_round()
# play_phase_model.play_card()
# play_phase_model.play_card()
# play_phase_model.play_card()
# play_phase_model.play_card()
# play_phase_model.play_card()
# play_phase_model.play_card()
# play_phase_model.play_card()
# play_phase_model.play_card()
# play_phase_model.play_card()
# play_phase_model.play_card()
# play_phase_model.play_card()
# play_phase_model.play_card()
