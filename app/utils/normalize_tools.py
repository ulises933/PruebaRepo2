from typing import TypeVar, List

T = TypeVar('T')

def normalize_list(value: T) -> List[T]:
    if value is None:
        return []
    elif isinstance(value, list):
        return value
    else:
        return [value]