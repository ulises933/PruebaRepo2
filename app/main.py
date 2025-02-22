import logging as log

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from google.cloud import logging as gcp_logging
from sqlalchemy.exc import OperationalError
from starlette.middleware.trustedhost import TrustedHostMiddleware

from app.bussiness_logic.endpoints import business_logic_router
from app.exception import exception_handler, DoesNotExist, does_not_exist_handler
from app.env_variables import LOGGING_NAME
from app.database import engine
from app.bussiness_logic.db_models import Base

Base.metadata.create_all(bind=engine)

#Add handling error
try:
    logging_client = gcp_logging.Client()
    logging_client.setup_logging(name=LOGGING_NAME)
except Exception as e:
   log.warning(e)

app = FastAPI()
app.root_path = "/"

# En esta seccion se añade el router a la app para incluir todas las ruta de un router
app.include_router(business_logic_router)


# En esta seccion se añade handlers para las exception y se pueda hacer un manejo de las exceptions
app.add_exception_handler(Exception, exception_handler)
app.add_exception_handler(OperationalError, exception_handler)
app.add_exception_handler(DoesNotExist, does_not_exist_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers  
)
app.add_middleware(TrustedHostMiddleware, allowed_hosts=["*"])
