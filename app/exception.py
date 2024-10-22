from fastapi import Request
from fastapi.responses import JSONResponse


class DoesNotExist(Exception):
    pass


def does_not_exist_handler(request: Request, exc: DoesNotExist):
    return JSONResponse(status_code=404, content={'message': "obj not found"})


def exception_handler(request: Request, exc: Exception):
    return JSONResponse(status_code=500, content={'message': "Unexpected exception"})
