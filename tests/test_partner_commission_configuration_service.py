import pytest
from app.bussiness_logic.partner_commission_configuration_service import PartnerCommissionConfigurationService, PartnerConfiguration, PartnerConfigurationUpdate
from app.bussiness_logic.db_models import PartnerCommissionConfiguration
from app.exception import PartnerConfigurationDoesNotExistError
from datetime import datetime, UTC
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

@pytest.fixture
def db_session_mock(mocker):
    return mocker.Mock(spec=Session)

@pytest.fixture
def partner_commission_configuration_service(db_session_mock):
    return PartnerCommissionConfigurationService(db_session_mock)

@pytest.fixture
def partner_configuration_data():
    return PartnerConfiguration(
        personnel_number="123",
        full_name="John Doe",
        commission_percent=10.0,
        fixed_fee=100.0,
        customer_price_group="A"
    )

@pytest.fixture(scope='module')
def test_db():
    # Create an in-memory SQLite database for testing
    engine = create_engine('sqlite:///:memory:')
    Session = sessionmaker(bind=engine)
    session = Session()

    # Create the tables
    PartnerCommissionConfiguration.__table__.create(bind=engine)

    yield session  # This will be the session used in tests

    session.close()  # Cleanup after tests

@pytest.mark.asyncio
async def test_list_configurations(partner_commission_configuration_service, db_session_mock):
    mock_configurations = [PartnerCommissionConfiguration(personnel_number="123", full_name="John Doe", commission_percent=10.0, fixed_fee=100.0, customer_price_group="A")]
    db_session_mock.query.return_value.filter_by.return_value.all.return_value = mock_configurations
    
    result = partner_commission_configuration_service.listConfigurations("A")
    
    assert len(result) == 1
    assert result[0].personnel_number == "123"
    assert result[0].full_name == "John Doe"

@pytest.mark.asyncio
async def test_get_configuration(partner_commission_configuration_service, db_session_mock, partner_configuration_data):
    db_session_mock.query.return_value.filter_by.return_value.first.return_value = PartnerCommissionConfiguration(**partner_configuration_data.model_dump())
    
    result = partner_commission_configuration_service.getConfiguration("123")
    
    assert result.personnel_number == "123"
    assert result.full_name == "John Doe"

@pytest.mark.asyncio
async def test_create_configuration(partner_commission_configuration_service, db_session_mock, partner_configuration_data, mocker):
    db_session_mock.add = mocker.Mock()
    db_session_mock.commit = mocker.Mock()
    
    result = partner_commission_configuration_service.createConfiguration(partner_configuration_data, "test_user")
    
    assert result.personnel_number == "123"
    assert result.full_name == "John Doe"
    db_session_mock.add.assert_called_once()
    db_session_mock.commit.assert_called_once()

@pytest.mark.asyncio
async def test_update_configuration(partner_commission_configuration_service, db_session_mock, partner_configuration_data):
    existing_config = PartnerCommissionConfiguration(**partner_configuration_data.model_dump())
    db_session_mock.query.return_value.filter_by.return_value.first.return_value = existing_config
    
    updated_data = PartnerConfigurationUpdate(
        id=1,
        commission_percent=15.0,
        fixed_fee=150.0,
    )
    
    result = partner_commission_configuration_service.updateConfiguration(updated_data, "test_user")
    
    assert result.commission_percent == 15.0
    assert result.fixed_fee == 150.0
    db_session_mock.commit.assert_called_once()

@pytest.mark.asyncio
async def test_update_configuration_not_found(partner_commission_configuration_service, db_session_mock):
    db_session_mock.query.return_value.get.return_value = None
    
    with pytest.raises(PartnerConfigurationDoesNotExistError):
        partner_commission_configuration_service.updateConfiguration(PartnerConfigurationUpdate(id=1,commission_percent=10.0, fixed_fee=100.0), "test_user")

def test_bulk_update_configurations(test_db):
    service = PartnerCommissionConfigurationService(test_db)

    # Prepare initial data
    initial_data = [
        PartnerCommissionConfiguration(
            id=1,
            personnel_number='123',
            full_name='John Doe',
            commission_percent=10.0,
            fixed_fee=100.0,
            customer_price_group='A',
            date_created=datetime.now(UTC),
            last_modified_date=datetime.now(UTC),
            last_modified_user='admin'
        ),
        PartnerCommissionConfiguration(
            id=2,
            personnel_number='456',
            full_name='Jane Smith',
            commission_percent=15.0,
            fixed_fee=150.0,
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
        PartnerConfigurationUpdate(
            id=1,
            commission_percent=12.0,
            fixed_fee=120.0,
        ),
        PartnerConfigurationUpdate(
            id=2,
            commission_percent=18.0,
            fixed_fee=180.0,
        )
    ]

    # Call the bulk update method
    updated_configurations = service.bulkUpdateConfigurations(updated_data, user_mod='admin')

    # Verify the updates
    for config in updated_configurations:
        db_config = test_db.query(PartnerCommissionConfiguration).filter_by(personnel_number=config.personnel_number).first()
        assert db_config is not None
        assert db_config.commission_percent == config.commission_percent
        assert db_config.fixed_fee == config.fixed_fee
        assert db_config.last_modified_user == 'admin' 