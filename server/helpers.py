
def logging_changes(func):
    def wrapper(*args, **kwargs):
        _instance = args[0]
        old_state = str(_instance.get_state())
        res = func(*args, **kwargs)
        new_state = str(_instance.get_state())
        print('[{}]: info updated.\n\told state: {}\n\tnew state: {}'.format(
            _instance.__class__.__name__, old_state, new_state))
        return res
    return wrapper
