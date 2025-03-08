import pytest
from app.bussiness_logic.partner_commission_configuration_service import PartnerCommissionConfigurationService, PartnerConfiguration
from app.bussiness_logic.db_models import PartnerCommissionConfiguration
from app.exception import PartnerConfigurationDoesNotExistError
from datetime import datetime
from sqlalchemy.orm import Session

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
    
    updated_data = PartnerConfiguration(
        personnel_number="123",
        full_name="John Doe",
        commission_percent=15.0,
        fixed_fee=150.0,
        customer_price_group="A"
    )
    
    result = partner_commission_configuration_service.updateConfiguration(updated_data, "test_user")
    
    assert result.commission_percent == 15.0
    assert result.fixed_fee == 150.0
    db_session_mock.commit.assert_called_once()

@pytest.mark.asyncio
async def test_update_configuration_not_found(partner_commission_configuration_service, db_session_mock):
    db_session_mock.query.return_value.filter_by.return_value.first.return_value = None
    
    with pytest.raises(PartnerConfigurationDoesNotExistError):
        partner_commission_configuration_service.updateConfiguration(PartnerConfiguration(personnel_number="999", full_name="Jane Doe", commission_percent=10.0, fixed_fee=100.0, customer_price_group="B"), "test_user") 