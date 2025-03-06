import pytest
from sqlalchemy.orm import Session
from app.bussiness_logic.factura_tracking_service import BillingDocumentTrackingService
from app.bussiness_logic.corte_mensual_service import MonthlyCutService
from app.bussiness_logic.comisiones_service import CommissionsService
from app.bussiness_logic.db_models import BillingDocumentTracking, BillingDocumentStatus, MonthlyCut, MonthlyCutStatus
from app.exception import BillingCycleDoesNotExistError, BillingDocumentOutOfBillingCycleError
from unittest.mock import AsyncMock

@pytest.fixture
def db_session(mocker):
    # db session mock
    return mocker.Mock(spec=Session)

@pytest.fixture
def billing_document_tracking_service(db_session, mocker):
    return BillingDocumentTrackingService(db_session, mocker.Mock())

@pytest.fixture
def monthly_cut_service(db_session):
    return MonthlyCutService(db_session)

@pytest.fixture
def commissions_service(mocker):
    monthly_cut_service_mock = mocker.Mock()
    billing_document_service_mock = mocker.Mock()
    sap_api_service_mock = mocker.Mock()
    sap_odata_service_mock = mocker.Mock()
    
    return CommissionsService(monthly_cut_service_mock, billing_document_service_mock, sap_api_service_mock, sap_odata_service_mock)

@pytest.fixture
def open_monthly_cut(commissions_service, mocker):
    monthly_cut = MonthlyCut(id=1, status=MonthlyCutStatus.OPEN)
    mocker.patch.object(commissions_service.monthly_cut_service, 'get_monthly_cut_by_period', new_callable=AsyncMock, return_value=monthly_cut)
    return monthly_cut

@pytest.fixture
def closed_monthly_cut(commissions_service, mocker):
    monthly_cut = MonthlyCut(id=1, status=MonthlyCutStatus.CLOSED)
    mocker.patch.object(commissions_service.monthly_cut_service, 'get_monthly_cut_by_period', new_callable=AsyncMock, return_value=monthly_cut)
    return monthly_cut

@pytest.fixture
def corte_actual(commissions_service, mocker):
    monthly_cut = MonthlyCut(id=1, status=MonthlyCutStatus.OPEN)
    mocker.patch.object(commissions_service.monthly_cut_service, 'get_current_monthly_cut', return_value=monthly_cut)
    return monthly_cut

@pytest.mark.asyncio
async def test_close_monthly_cut(commissions_service, mocker):
    commissions_service.monthly_cut_service.get_monthly_cut_by_period = AsyncMock(return_value=MonthlyCut(id=1, status=MonthlyCutStatus.CLOSED))
    commissions_service.sap_api_service.get_billing_documents = AsyncMock(return_value={"A_BillingDocumentType": []})
    
    commissions_service.sap_odata_service.send_invoice_to_sap = AsyncMock(return_value={"status": "success"})
    
    commissions_service.monthly_cut_service.close_monthly_cut = AsyncMock()

    result = await commissions_service.close_monthly_cut(2024, 12, "test_personnel", "test_group", "EN", "test_user")
    
    assert result["status"] == "success"

@pytest.mark.asyncio
async def test_get_billing_docs_open_monthly_cut(commissions_service, open_monthly_cut, mocker):
    commissions_service.sap_api_service.get_billing_documents = AsyncMock(return_value={
        "A_BillingDocumentType": [
            {"BillingDocumentStatus": "Completed", "InvoiceIsClearing": "false"}
        ]
    })
    commissions_service.billing_doc_tracking_service.process_billing_document = AsyncMock(return_value=BillingDocumentTracking(id=1, billing_document="1000000222", total_amount=100.0))
    
    result = await commissions_service.getBillingDocuments(2024, 12, "test_personnel", "test_group", "EN")
    
    assert len(result) == 1
    assert result[0].billing_document == "1000000222"
    assert result[0].total_amount == 100.0

@pytest.mark.asyncio
async def test_get_billing_docs_closed_monthly_cut(commissions_service, closed_monthly_cut, mocker):
    commissions_service.billing_doc_tracking_service.get_billing_documents_by_monthly_cut_id = mocker.Mock(return_value=[BillingDocumentTracking(id=1, billing_document="1000000222", total_amount=100.0)])
    
    result = await commissions_service.getBillingDocuments(2024, 12, "test_personnel", "test_group", "EN")
    
    assert len(result) == 1
    assert result[0].billing_document == "1000000222"
    assert result[0].total_amount == 100.0

@pytest.mark.asyncio
async def test_get_billing_docs_invalid_status(commissions_service, open_monthly_cut, mocker):
    commissions_service.sap_api_service.get_billing_documents = AsyncMock(return_value={
        "A_BillingDocumentType": [
            {"BillingDocumentStatus": "Pending", "InvoiceIsClearing": "false"}  # Estado no válido
        ]
    })
    
    result = await commissions_service.getBillingDocuments(2024, 12, "test_personnel", "test_group", "EN")
    
    assert len(result) == 0

@pytest.mark.asyncio
async def test_update_billing_document_status_success(commissions_service, corte_actual, mocker):
    # Mockear las billing_documents que pertenecen al monthly_cut actual
    modified_billing_docs = [BillingDocumentTracking(id=1, status=BillingDocumentStatus.PAYABLE, monthly_cut_id=corte_actual.id)]
    commissions_service.billing_doc_tracking_service.update_billing_document_status = mocker.Mock()
    
    commissions_service.update_billing_document_status(modified_billing_docs, "test_user")
    
    commissions_service.billing_doc_tracking_service.update_billing_document_status.assert_called_once_with(1, BillingDocumentStatus.PAYABLE, "test_user")

@pytest.mark.asyncio
async def test_update_billing_document_status_non_existent_monthly_cut(commissions_service, mocker):
    commissions_service.monthly_cut_service.get_current_monthly_cut = mocker.Mock(return_value=None)
    
    with pytest.raises(BillingCycleDoesNotExistError, match="No billing cycle has been created yet."):
        commissions_service.update_billing_document_status([], "test_user")

@pytest.mark.asyncio
async def test_update_billing_document_status_out_of_monthly_cut(commissions_service, corte_actual, mocker):    
    modified_billing_docs = [BillingDocumentTracking(id=1, status=BillingDocumentStatus.PAYABLE, monthly_cut_id=999)]
    with pytest.raises(BillingDocumentOutOfBillingCycleError):
        commissions_service.update_billing_document_status(modified_billing_docs, "test_user")

