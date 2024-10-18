from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.trustedhost import TrustedHostMiddleware

from app.bussiness_logic.endpoints import business_logic_router

app = FastAPI()
app.root_path = "/"

app.include_router(business_logic_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers  
)
app.add_middleware(TrustedHostMiddleware, allowed_hosts=["*"])
