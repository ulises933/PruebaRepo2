import pytest
from app.bussiness_logic.partner_catalog_service import PartnerCatalogService
from app.bussiness_logic.sap_api_service import SAPApiService
from datetime import datetime

@pytest.fixture
def sap_api_service_mock(mocker):
    return mocker.Mock(spec=SAPApiService)

@pytest.fixture
def partner_catalog_service(sap_api_service_mock):
    return PartnerCatalogService(sap_api_service_mock)

@pytest.mark.asyncio
async def test_fetch_billing_documents_from_sap_multiple_docs(partner_catalog_service, sap_api_service_mock):
    current_date = datetime.now()
    sap_api_service_mock.get_billing_documents.return_value = {
        'A_BillingDocumentType': [{'to_Item': {'A_BillingDocumentItemType': []}}]
    }
    
    result = await partner_catalog_service.fetch_billing_documents_from_sap()
    
    assert result == [{'to_Item': {'A_BillingDocumentItemType': []}}]
    sap_api_service_mock.get_billing_documents.assert_called_once_with(current_date.year, current_date.month, 0, "")

@pytest.mark.asyncio
async def test_fetch_billing_documents_from_sap_single_doc(partner_catalog_service, sap_api_service_mock):
    current_date = datetime.now()
    sap_api_service_mock.get_billing_documents.return_value = {
        'A_BillingDocumentType': {'to_Item': {'A_BillingDocumentItemType': []}}
    }
    
    result = await partner_catalog_service.fetch_billing_documents_from_sap()
    
    assert result == [{'to_Item': {'A_BillingDocumentItemType': []}}]
    sap_api_service_mock.get_billing_documents.assert_called_once_with(current_date.year, current_date.month, 0, "")

@pytest.mark.asyncio
async def test_get_partners(partner_catalog_service, sap_api_service_mock, mocker):
    billing_document = {
        'to_Item': {
            'A_BillingDocumentItemType': [
                {'to_Partner': {'A_BillingDocumentItemPartnerType': {'Personnel': '123', 'FullName': 'John Doe'}}}
            ]
        }
    }
    sap_api_service_mock.get_billing_documents.return_value = {
        'A_BillingDocumentType': [billing_document]
    }
    
    result = await partner_catalog_service.get_partners()
    
    assert len(result) == 1
    assert result[0]['personnel_number'] == '123'
    assert result[0]['full_name'] == 'John Doe'
    sap_api_service_mock.get_billing_documents.assert_called_once()

@pytest.mark.asyncio
async def test_get_partners_no_billing_documents(partner_catalog_service, sap_api_service_mock):
    sap_api_service_mock.get_billing_documents.return_value = {
        'A_BillingDocumentType': None
    }
    
    result = await partner_catalog_service.get_partners()
    
    assert result == []
    sap_api_service_mock.get_billing_documents.assert_called_once()