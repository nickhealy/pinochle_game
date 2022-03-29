from TurnModel import turn_model
import enum
from transitions import Machine
from PlayInfo import play_info
from GameScore import game_score


class PlayPhaseModel(object):

    def __init__(self, play_info, game_score):
        self.__play_info = play_info
        self.__game_score = game_score

    def on_exit_PLAY_START(self, _):
        print("[PlayPhase]: starting the play")

    def on_exit_ROUND_END(self, _):
        print("[PlayPhase]: resetting the table")
        self.__play_info.reset_game()

    def mark_round_start(self, _):
        print("[PlayPhase]: Starting round {}".format(
            self.__play_info.round_number))

    def log_new_position(self, _):
        print("[PlayPhase]: play now at position {}".format(self.state))

    def on_enter_PLAY_END(self, _):
        print("[PlayPhase]: play has ended")

    def end_round(self, _):
        print('[PlayPhase]: round has ended')

        winner = self.__play_info.get_hand_winner()
        assert winner is not None
        self.__game_score.handle_round_end(winner=winner,
                                           played_hands=self.__play_info.current_plays)

        # either handle end of play or start next turn
        if (self.__play_info.is_play_over):
            print('[PlayPhase]: play is over, ending play')
            self.play_end()
        else:
            print('[PlayPhase]: winner has been chosen to be {}, they will now start'.format(
                winner))
            turn_model.change_start_player(winner)
            self.new_round()

    def handle_played_card(self, event):
        card_id = event.kwargs.get('card_id')
        player = turn_model.state
        print("[PlayPhase]: {} just played {}".format(
            turn_model.state, card_id))
        self.__play_info.add_play(player, card_id)

    def handle_play_end(self, _):
        self.__game_score.handle_play_end()

    def advance_turn_state(self, _):
        turn_model.next_turn()


class States(enum.Enum):
    PLAY_START = 0,
    POS_A = 1,
    POS_B = 2,
    POS_C = 3,
    POS_D = 4,
    ROUND_END = 5,
    PLAY_END = 6,


play_phase_model = PlayPhaseModel(play_info=play_info, game_score=game_score)

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
        'dest': States.PLAY_END, 'after': 'handle_play_end'},
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
play_phase_model.play_card(card_id='9S')
play_phase_model.play_card(card_id='JS')
play_phase_model.play_card(card_id='AS')
play_phase_model.play_card(card_id='10S')
play_phase_model.play_card(card_id='9D')
play_phase_model.play_card(card_id='AD')
play_phase_model.play_card(card_id='10D')
play_phase_model.play_card(card_id='QH')
# play_phase_model.play_card()
# play_phase_model.play_card()
# play_phase_model.play_card()
# play_phase_model.play_card()
