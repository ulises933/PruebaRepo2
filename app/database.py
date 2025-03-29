from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy import text
import os
from app.bussiness_logic.initial_data import initial_inserts

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

def seed_initial_data():
    db = SessionLocal()
    try:
        for insert_stmt in initial_inserts:
            db.execute(text(insert_stmt))
            db.commit()
    finally:
        db.close()

