from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
import os

DB_DIR = "data"
if not os.path.exists(DB_DIR):
    os.makedirs(DB_DIR)

# SQLite URL - creará la BD en data/facturas_tracking.db
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_DIR}/facturas_tracking.db"

# Crear el engine (check_same_thread=False necesario para SQLite con FastAPI)
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 