
from fastapi import APIRouter, HTTPException

from app.bussiness_logic.get_all_business_logic import get_all_objs
from app.bussiness_logic.get_businesss_logic import get_obj
from app.bussiness_logic.post_business_logic import create_obj, Obj
from app.bussiness_logic.put_business_logic import update_obj
from app.bussiness_logic.delete_business_logic import delete_obj
from app.exception import DoesNotExist

business_logic_router = APIRouter()


@business_logic_router.get("/objs/")
async def get_all_objs_url():
    return get_all_objs()


@business_logic_router.get("/objs/{path_param}")
async def get_obj_url(path_param: int, query_param: str = None):
    try:
        return get_obj(path_param, query_param)
    except DoesNotExist:
        raise HTTPException(status_code=404, detail="obj not found")


@business_logic_router.post("/objs/")
async def create_obj_url(obj: Obj):
    return create_obj(obj)


@business_logic_router.put("/objs/{path_param}")
async def update_obj_url(path_param: int, obj: Obj):
    try:
        return update_obj(path_param, obj)
    except DoesNotExist:
        raise HTTPException(status_code=404, detail="obj not found")


@business_logic_router.delete("/objs/{path_param}")
async def delete_obj_url(path_param: str):
    try:
        return delete_obj(path_param)
    except DoesNotExist:
        raise HTTPException(status_code=404, detail="obj not found")
