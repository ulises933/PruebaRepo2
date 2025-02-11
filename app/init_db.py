from database import engine
from bussiness_logic.db_models import Base

def init_db():
    Base.metadata.create_all(bind=engine)

if __name__ == "__main__":
    print("Creando base de datos...")
    init_db()
    print("¡Base de datos creada!") 