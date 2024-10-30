from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from app.env_variables import TRINO_USER, TRINO_PASS, TRINO_HOST, TRINO_PORT
from bussiness_logic.db_models import Base


class SQLOperations:

    def __init__(self, catalog):
        user_pass = f'{TRINO_USER}:{TRINO_PASS}' if TRINO_PASS else TRINO_USER
        self.engine = create_engine(f'trino://{user_pass}@{TRINO_HOST}:{TRINO_PORT}/{catalog}')

    def execute_query(self, modelo: Base, *filters, page_size: int = 10, page_number: int = 1,
                      order_by: str = None):
        offset_value = (page_number - 1) * page_size if page_size and page_number else None
        session = self._create_session()
        results = (
            session.query(modelo)
            .filter(*filters)
            .order_by(order_by)
            .offset(offset_value)
            .limit(page_size)
        ).all()
        session.close()
        return results

    def insert_record(self, modelo: Base):
        session = self._create_session()
        session.add(modelo)
        self._commit_close_session(session)

    def update_record(self, modelo: Base, *filters, **updated_data):
        session = self._create_session()
        session.query(modelo).filter(*filters).update(**updated_data)
        self._commit_close_session(session)

    def _create_session(self):
        return sessionmaker(bind=self.engine)()

    @staticmethod
    def _commit_close_session(session):
        session.commit()
        session.close()
