from sqlalchemy import create_engine, text
from app.env_variables import DB_USER, DB_PASS, DB_HOST, DB_PORT


class SQLServerOperations:

    def __init__(self, database):
        server = f'{DB_HOST}:{DB_PORT}' if DB_PORT else DB_HOST
        self.connection_string = f"mssql+pyodbc://{DB_USER}:{DB_PASS}@{server}/{database}"
        self.engine = create_engine(self.connection_string)

    def execute_simple_select(self, fields: str, table: str, conditions: str):
        return self.execute_query(f'SELECT {fields} FROM {table} WHERE {conditions}')

    def execute_query(self, query, params=None):
        with self.engine.connect() as conn:
            result = conn.execute(text(query), params)
            return [dict(row) for row in result.fetchall()]

    def execute_simple_inser(self, table: str, columns: str, values: str):
        return self.execute_non_query(f'INSERT INTO {table} ({columns}) VALUES ({values})')

    def execute_non_query(self, query, params=None):
        with self.engine.connect() as conn:
            conn.execute(text(query), params)
