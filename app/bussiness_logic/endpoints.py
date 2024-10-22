from fastapi import APIRouter, Request

from app.bussiness_logic.get_all_business_logic import get_all_objs
from app.bussiness_logic.get_businesss_logic import get_obj
from app.bussiness_logic.post_business_logic import create_obj, Obj
from app.bussiness_logic.put_business_logic import update_obj
from app.bussiness_logic.delete_business_logic import delete_obj
from reponse_formatter import format_response

business_logic_router = APIRouter()


@business_logic_router.get("/objs/")
async def get_all_objs_url(request: Request, page_size=10, page_number=1):
    data = get_all_objs(page_size, page_number)
    return format_response(request, data)


@business_logic_router.get("/objs/{path_param}")
async def get_obj_url(request: Request, path_param: int, query_param: str = None, page_size=10, page_number=1):
    data = get_obj(path_param, query_param)
    return format_response(request, data)


@business_logic_router.post("/objs/")
async def create_obj_url(request: Request, obj: Obj):
    data = create_obj(obj)
    return format_response(request, data)


@business_logic_router.put("/objs/{path_param}")
async def update_obj_url(request: Request, path_param: int, obj: Obj):
    data = update_obj(path_param, obj)
    return format_response(request, data)


@business_logic_router.delete("/objs/{path_param}")
async def delete_obj_url(request: Request, path_param: str):
    data = delete_obj(path_param)
    return format_response(request, data)
