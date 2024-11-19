import pandas as pd
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.env_variables import TRINO_USER, TRINO_PASS, TRINO_HOST, TRINO_PORT
from app.bussiness_logic.db_models import Base


class SQLOperations:

    def __init__(self, catalog):
        user_pass = f'{TRINO_USER}:{TRINO_PASS}' if TRINO_PASS else TRINO_USER
        self.engine = create_engine(f'trino://{user_pass}@{TRINO_HOST}:{TRINO_PORT}/{catalog}')

    def execute_query(self, modelo: Base, *filters, joins=None, page_size: int = 10, page_number: int = 1,
                      order_by: str = None):
        '''
        :param modelo: Es el modelo de la base de datos a las que se hara el query
        :param filters: Estos argumentos son los filtros se usan como positional arguments, ej:
                        modelo_1.columna_1 == 5, modelo_1.columna_2 > 0
        :param joins: Lista de tuplas con los joins la primera posicion de la tupla es el modelo,la segunda es la
                      condicion y la tercera es si es 'left'(outerjoin) o 'inner'(join), ej:
                      (modelo_2, modelo_1.columna_3 == modelo_2.columna_1, 'inner')
        :param page_size: Numero de resultados en la pagina
        :param page_number: Numero de pagina
        :param order_by: Campo por el cual se va a ordenar los resultados
        :return:
        '''
        query, session = self._get_query_and_session(filters, joins, modelo, order_by, page_number, page_size)

        results = query.all()

        session.close()
        return results

    def execute_query_df(self, modelo: Base, *filters, joins=None, page_size: int = None, page_number: int = None,
                         order_by: str = None):
        '''
        Similar to execute_query but returns a pandas DataFrame instead of ORM objects

        :param modelo: Database model to query
        :param filters: Filter conditions as positional arguments, e.g.:
                       modelo_1.columna_1 == 5, modelo_1.columna_2 > 0
        :param joins: List of tuples with joins (model, condition, join_type), e.g.:
                     (modelo_2, modelo_1.columna_3 == modelo_2.columna_1, 'inner')
        :param page_size: Number of results per page
        :param page_number: Page number
        :param order_by: Field to order results by
        :return: pandas DataFrame with query results
        '''
        query, session = self._get_query_and_session(filters, joins, modelo, order_by, page_number, page_size)

        # Convert to pandas DataFrame
        df = pd.read_sql(query.statement, self.engine)
        session.close()
        return df

    def _get_query_and_session(self, filters, joins, modelo, order_by, page_number, page_size):
        joins = joins or []
        offset_value = (page_number - 1) * page_size if page_size and page_number else None
        session = self._create_session()
        query = session.query(modelo)
        for join_info in joins:
            if isinstance(join_info, tuple):
                table, condition, join_type = join_info
                if join_type == 'left':
                    query = query.outerjoin(table, condition)
                else:
                    query = query.join(table, condition)
            else:
                query = query.join(join_info)
        query = (
            query.filter(*filters)
            .order_by(order_by)
            .offset(offset_value)
            .limit(page_size)
        )
        return query, session

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
