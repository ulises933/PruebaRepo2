from pydantic import BaseModel


class Obj(BaseModel):
    name: str
    description: str = None


def create_obj(obj: Obj):
    return obj
