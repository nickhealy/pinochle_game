from TurnModel import turn_model
import enum
from transitions import Machine
from GameInfo import game_info
import random


count = 0


class PlayPhaseModel(object):

    def __init__(self, game_info):
        self.__game_info = game_info

    def on_exit_PLAY_START(self, _):
        print("[PlayPhase]: starting the play")

    def mark_round_start(self, _):
        print("[PlayPhase]: Moving to POS_A, beginning of round {}".format(count + 1))

    def log_new_position(self, _):
        print("[PlayPhase]: play now at position {}".format(self.state))

    def on_enter_PLAY_END(self, _):
        print("[PlayPhase]: play has ended")

    def end_round(self, _):
        print('[PlayPhase]: round has ended')
        if (self.is_play_over):
            print('[PlayPhase]: play is over, ending play')
            self.play_end()
            return

        winner = self.__game_info.get_hand_winner()
        assert winner is not None
        print('[PlayPhase]: winner has been chosen to be {}, they will now start'.format(
            winner))
        [
            turn_model.to_Pl_0,
            turn_model.to_Pl_1,
            turn_model.to_Pl_2,
            turn_model.to_Pl_3
        ][winner]()
        self.new_round()

    def handle_played_card(self, event):
        card_id = event.kwargs.get('card_id')
        player = turn_model.state
        print("[PlayPhase]: {} just played {}".format(
            turn_model.state, card_id))
        self.__game_info.add_play(player, card_id)

    def advance_turn_state(self, _):
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


play_phase_model = PlayPhaseModel(game_info=game_info)

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
        States.PLAY_START, States.ROUND_END], 'dest': States.POS_A, 'after': 'mark_round_start'},
    {'trigger': 'play_card', 'source': States.POS_A,
        'dest': States.POS_B, 'before': 'handle_played_card', 'after': 'advance_turn_state'},
    {'trigger': 'play_card', 'source': States.POS_B,
        'dest': States.POS_C, 'before': 'handle_played_card', 'after': 'advance_turn_state'},
    {'trigger': 'play_card', 'source': States.POS_C,
        'dest': States.POS_D, 'before': 'handle_played_card', 'after': 'advance_turn_state'},
    {'trigger': 'play_card', 'source': States.POS_D,
        'dest': States.ROUND_END, 'before': 'handle_played_card', 'after': 'end_round'},
    {'trigger': 'play_end', 'source': States.ROUND_END,
        'dest': States.PLAY_END},
]

play_phase_machine = Machine(
    play_phase_model,
    states=states,
    transitions=transitions,
    initial=States.PLAY_START,
    auto_transitions=False,
    send_event=True,
    after_state_change='log_new_position'
)


play_phase_model.new_round()
play_phase_model.play_card(card_id='5S')
play_phase_model.play_card(card_id='6S')
play_phase_model.play_card(card_id='8S')
play_phase_model.play_card(card_id='3S')
# play_phase_model.play_card(card_id='AS')
# play_phase_model.play_card(card_id='5H')
# play_phase_model.play_card(card_id='JD')
# play_phase_model.play_card(card_id='10D')
# play_phase_model.play_card()
# play_phase_model.play_card()
# play_phase_model.play_card()
# play_phase_model.play_card()
