import pathlib
from enum import auto, Enum
from typing import Any, List

REPO_DIR = str(pathlib.Path(__file__).parent.parent.parent.parent.absolute())
APP_NAME = 'video'


class NamedEnum(Enum):
    @staticmethod
    def _generate_next_value_(name: str, start: int, count: int, last_values: List[Any]) -> Any:
        return name.lower()

    @classmethod
    def get_values(cls):
        return [i.value for i in cls]

    @classmethod
    def validate(cls, item_to_validate: str) -> bool:
        return item_to_validate.lower() in cls.get_values()

    @classmethod
    def from_value(cls, value: str):
        for cls_value in cls:
            if cls_value.value.lower() == value.lower():
                return cls_value
        raise ValueError(f"unknown value: {value} use one of {cls.get_values()}")

    def __str__(self):
        return f'{self.value.lower()}'


class Task(NamedEnum):
    INTERACTIVE = auto()

class EditMode(NamedEnum):
    BLUR = auto()
    SALT_AND_PEPPER_NOISE = auto()
    X264 = auto()
    TEST = auto()
