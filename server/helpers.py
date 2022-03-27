
def logging_changes(func):
    def wrapper(*args, **kwargs):
        _instance = args[0]
        old_state = _instance.get_state()
        func(*args, **kwargs)
        new_state = _instance.get_state()
        print('[{}]: info updated.\n\told state: {}\n\tnew state: {}'.format(
            _instance.__class__.__name__, old_state, new_state))
    return wrapper
