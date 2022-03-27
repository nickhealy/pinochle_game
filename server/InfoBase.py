from abc import ABC, abstractmethod


class InfoBase(ABC):
    @abstractmethod
    def get_state(self):
        pass
