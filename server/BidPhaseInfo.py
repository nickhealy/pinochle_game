class BidPhaseInfo(object):
    def __init__(self):
        self.__bid_status = [True, True, True, True]
        self.__bids = ["0", "0", "0", "0"]

    def logging_changes(func):
        def wrapper(*args, **kwargs):
            _instance = args[0]
            old_state = _instance.get_bid_state()
            func(*args, **kwargs)
            new_state = _instance.get_bid_state()
            print('[bid_info]: info updated.\n\told state: {}\n\tnew state: {}'.format(
                old_state, new_state))
        return wrapper

    @logging_changes
    def update_bid(self, player_id, new_bid):
        self.__bids[player_id] = new_bid

    @logging_changes
    def remove_player(self, player_id):
        self.__bid_status[player_id] = False

    @property
    def bid_winner(self):
        active_players = [i for i, pl in enumerate(self.__bid_status) if pl]
        return active_players[0] if len(active_players) == 1 else None

    def get_bid_for_player(self, player_id):
        return self.__bids[player_id]

    def get_bid_state(self):
        return list(zip(self.__bids, self.__bid_status))
