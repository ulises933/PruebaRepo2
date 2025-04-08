import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.bussiness_logic.db_models import Base, Capturist
from sqlalchemy.pool import StaticPool

@pytest.fixture(scope="session")
def engine():
    # Use connect_args to allow SQLite to work with multiple threads
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        echo=True
    )
    return engine

@pytest.fixture(scope="session")
def tables(engine):
    Base.metadata.create_all(engine)
    yield
    Base.metadata.drop_all(engine)

@pytest.fixture
def db_session(engine, tables):
    """Returns an sqlalchemy session, and after the test tears down everything properly."""
    connection = engine.connect()
    transaction = connection.begin()
    Session = sessionmaker(bind=connection)
    session = Session()

    yield session

    session.close()
    transaction.rollback()
    connection.close() 