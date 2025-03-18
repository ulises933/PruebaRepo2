import pytest
from app.bussiness_logic.item_commission_configuration_service import ItemCommissionConfigurationService, ItemConfiguration, ItemConfigurationUpdate
from app.bussiness_logic.db_models import ItemCommissionConfiguration
from app.exception import ItemConfigurationDoesNotExistError
from datetime import datetime, UTC
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

@pytest.fixture
def db_session_mock(mocker):
    return mocker.Mock(spec=Session)

@pytest.fixture
def item_commission_configuration_service(db_session_mock):
    return ItemCommissionConfigurationService(db_session_mock)

@pytest.fixture
def item_configuration_data():
    return ItemConfiguration(
        id=1,
        group1="abc",
        group1_description="group1 description",
        group2="def",
        group2_description="group2 description",
        commission_percent=10.0,
        customer_price_group="A"
    )

@pytest.fixture(scope='module')
def test_db():
    # Create an in-memory SQLite database for testing
    engine = create_engine('sqlite:///:memory:')
    Session = sessionmaker(bind=engine)
    session = Session()

    # Create the tables
    ItemCommissionConfiguration.__table__.create(bind=engine)

    yield session  # This will be the session used in tests

    session.close()

@pytest.mark.asyncio
async def test_list_configurations(item_commission_configuration_service, db_session_mock):
    mock_configurations = [ItemCommissionConfiguration(group1="abc",
        group1_description="group1 description",
        group2="def",
        group2_description="group2 description",
        commission_percent=10.0,
        customer_price_group="A")]
    db_session_mock.query.return_value.filter_by.return_value.all.return_value = mock_configurations
    
    result = item_commission_configuration_service.list_configurations("A")
    
    assert len(result) == 1
    assert result[0].group1 == "abc"
    assert result[0].group2 == "def"

@pytest.mark.asyncio
async def test_get_configuration(item_commission_configuration_service, db_session_mock, item_configuration_data):
    db_session_mock.query.return_value.filter_by.return_value.first.return_value = ItemCommissionConfiguration(**item_configuration_data.model_dump())
    
    result = item_commission_configuration_service.get_configuration("A", "abc", "def")
    
    assert result.group1_description == "group1 description"
    assert result.commission_percent == 10.0

@pytest.mark.asyncio
async def test_create_configuration(item_commission_configuration_service, db_session_mock, item_configuration_data, mocker):
    db_session_mock.add = mocker.Mock()
    db_session_mock.commit = mocker.Mock()
    
    result = item_commission_configuration_service.create_configuration(item_configuration_data, "test_user")
    
    assert result.group1_description == "group1 description"
    assert result.commission_percent == 10.0
    assert result.last_modified_user == "test_user"
    db_session_mock.add.assert_called_once()
    db_session_mock.commit.assert_called_once()

@pytest.mark.asyncio
async def test_update_configuration(item_commission_configuration_service, db_session_mock, item_configuration_data):
    existing_config = ItemCommissionConfiguration(**item_configuration_data.model_dump())
    db_session_mock.query.return_value.filter_by.return_value.first.return_value = existing_config
    
    updated_data = ItemConfigurationUpdate(
        id=1,
        commission_percent=15.0,
    )
    
    result = item_commission_configuration_service.update_configuration(updated_data, "test_user")
    
    assert result.commission_percent == 15.0
    db_session_mock.commit.assert_called_once()

@pytest.mark.asyncio
async def test_update_configuration_not_found(item_commission_configuration_service, db_session_mock):
    db_session_mock.query.return_value.get.return_value = None
    
    with pytest.raises(ItemConfigurationDoesNotExistError):
        item_commission_configuration_service.update_configuration(ItemConfigurationUpdate(id=1,commission_percent=0.1), "test_user")

def test_bulk_update_configurations(test_db):
    service = ItemCommissionConfigurationService(test_db)

    # Prepare initial data
    initial_data = [
        ItemCommissionConfiguration(
            id=1,
            group1="abc",
            group1_description="group1 description",
            group2="def",
            group2_description="group2 description",
            commission_percent=30.0,
            customer_price_group='A',
            date_created=datetime.now(UTC),
            last_modified_date=datetime.now(UTC),
            last_modified_user='admin'
        ),
        ItemCommissionConfiguration(
            id=2,
            group1="abc",
            group1_description="group1 description",
            group2="xyz",
            group2_description="group2 description",
            commission_percent=50.0,
            customer_price_group='B',
            date_created=datetime.now(UTC),
            last_modified_date=datetime.now(UTC),
            last_modified_user='admin'
        )
    ]

    # Add initial data to the database
    test_db.add_all(initial_data)
    test_db.commit()

    # Prepare updated data
    updated_data = [
        ItemConfigurationUpdate(
            id=1,
            commission_percent=12.0,
        ),
        ItemConfigurationUpdate(
            id=2,
            commission_percent=18.0,
        )
    ]

    updated_configurations = service.bulk_update_configurations(updated_data, user_mod='admin')

    for config in updated_configurations:
        db_config = test_db.query(ItemCommissionConfiguration).filter_by(group1=config.group1,group2=config.group2,customer_price_group=config.customer_price_group).first()
        assert db_config is not None
        assert db_config.commission_percent == config.commission_percent
        assert db_config.last_modified_user == 'admin' 