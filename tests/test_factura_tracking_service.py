import pytest
from sqlalchemy.orm import Session
from app.bussiness_logic.factura_tracking_service import BillingDocumentTrackingService
from app.bussiness_logic.db_models import BillingDocumentTracking, BillingDocumentStatus
from app.exception import BillingDocumentDoesNotExistError
from unittest.mock import AsyncMock

@pytest.fixture
def billing_document_tracking_service(mocker):
    db_session_mock = mocker.Mock()  # db session mock
    legacy_system_service_mock = mocker.Mock()
    return BillingDocumentTrackingService(db_session_mock, legacy_system_service_mock)

@pytest.fixture
def factura_nueva():
    return {
        "BillingDocument": "123456",
        "TotalAmount": 1000,
        "to_Item": {
            "A_BillingDocumentItemType": [
                {
                    "Material": "MATERIAL_1",
                    "to_Partner": {
                        "A_BillingDocumentItemPartnerType": {
                            "Personnel": "00000008",
                            "FullName": "PU ROlES SD"
                        }
                    }
                },
                {
                    "Material": "MATERIAL_2",
                    "to_Partner": {
                        "A_BillingDocumentItemPartnerType": {
                            "Personnel": "00000008",
                            "FullName": "PU ROlES SD"
                        }
                    }
                }
            ]
        }
    }

@pytest.fixture
def existing_billing_document(billing_document_tracking_service, mocker):
    billing_document = BillingDocumentTracking(billing_document="123456", total_amount=500, status=BillingDocumentStatus.PAYABLE)
    mocker.patch.object(billing_document_tracking_service.db.query.return_value.filter_by.return_value, 'first', return_value=billing_document)
    mocker.patch.object(billing_document_tracking_service.db.query.return_value, 'get', return_value=billing_document)
    return billing_document

@pytest.fixture
def mock_consultar_articulos_comisionables(billing_document_tracking_service,mocker):
    return mocker.patch.object(billing_document_tracking_service.legacy_system_service, "get_commissionable_items",  new_callable=AsyncMock, return_value={"MATERIAL_1": {"comision": 100}, "MATERIAL_2": {"comision": 200}})

@pytest.fixture
def commissionable_items_query_mock(billing_document_tracking_service,mocker):
    return mocker.patch.object(billing_document_tracking_service.legacy_system_service, "get_commissionable_items",  new_callable=AsyncMock, return_value={"MATERIAL_NO_COMISIONABLE": {"comision": 0}})

@pytest.mark.asyncio
async def test_process_new_billing_document(billing_document_tracking_service, factura_nueva, mocker, mock_consultar_articulos_comisionables):
    billing_document_tracking_service.db.query.return_value.filter_by.return_value.first.return_value=None

    result = await billing_document_tracking_service.process_billing_document(factura_nueva, "test_user", 1)

    assert result.billing_document == "123456"
    assert result.total_amount == 1000
    assert result.status == BillingDocumentStatus.PAYABLE
    assert result.items == {"MATERIAL_1": {"comision": 100}, "MATERIAL_2": {"comision": 200}}
    assert result.commission_amount == 300
    billing_document_tracking_service.db.add.assert_called_once()
    billing_document_tracking_service.db.commit.assert_called_once()

@pytest.mark.asyncio
async def test_process_existing_billing_document(billing_document_tracking_service, factura_nueva, existing_billing_document, mocker, mock_consultar_articulos_comisionables):
    result = await billing_document_tracking_service.process_billing_document(factura_nueva, "test_user", 1)
    assert result.total_amount == 500
    assert result.commission_amount == 300
    billing_document_tracking_service.db.commit.assert_called_once()

@pytest.mark.asyncio
async def test_process_existing_billing_with_no_commissionable_items(billing_document_tracking_service, commissionable_items_query_mock, mocker):
    factura_sap = {
        "BillingDocument": "123456",
        "TotalAmount": 1000,
        "to_Item": {
            "A_BillingDocumentItemType": [
                {
                    "Material": "MATERIAL_NO_COMISIONABLE",
                    "to_Partner": {
                        "A_BillingDocumentItemPartnerType": {
                            "Personnel": "00000008",
                            "FullName": "PU ROlES SD"
                        }
                    }
                }
            ]
        }
    }
    
    mocker.patch.object(billing_document_tracking_service.db.query.return_value.filter_by.return_value, 'first', return_value=None)
    result = await billing_document_tracking_service.process_billing_document(factura_sap, "test_user", 1)
    assert result.commission_amount == 0 

@pytest.mark.asyncio
async def test_update_billing_document_successful(billing_document_tracking_service, mocker, existing_billing_document):
    result = billing_document_tracking_service.update_billing_document_status(1, BillingDocumentStatus.NOT_PAYABLE, "test_user")

    assert result.status == BillingDocumentStatus.NOT_PAYABLE
    assert result.last_modified_user == "test_user"
    assert result.last_modified_date is not None
    billing_document_tracking_service.db.commit.assert_called_once()

@pytest.mark.asyncio
async def test_update_non_existing_billing_document(billing_document_tracking_service, mocker):
    mocker.patch.object(billing_document_tracking_service.db.query.return_value, 'get', return_value=None)

    with pytest.raises(BillingDocumentDoesNotExistError, match="There is no billing document with id = 1"):
        billing_document_tracking_service.update_billing_document_status(1, BillingDocumentStatus.NOT_PAYABLE, "test_user")
