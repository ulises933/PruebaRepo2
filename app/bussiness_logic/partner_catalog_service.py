from app.bussiness_logic.factura_tracking_service import BillingDocumentTrackingService
from app.bussiness_logic.sap_api_service import SAPApiService
import logging
from datetime import datetime
from typing import TypeVar, List, Dict, Optional

T = TypeVar('T')

class PartnerCatalogService:
    def __init__(self, sap_api_service: SAPApiService):
        self.sap_api_service = sap_api_service

    @staticmethod
    def normalize_list(value: T) -> List[T]:
        if value is None:
            return []
        elif isinstance(value, list):
            return value
        else:
            return [value]

    async def fetch_billing_documents_from_sap(self, customer_price_group: str = "") -> List[Dict]:
        current_date = datetime.now()
        current_year, current_month = current_date.year, current_date.month
        #When 0, personnel_number filter takes no effect.
        personnel_number = 0
        billing_docs_response = await self.sap_api_service.get_billing_documents(current_year, current_month, personnel_number, customer_price_group)
        raw_billing_docs = billing_docs_response.get('A_BillingDocumentType')
        billing_documents = self.normalize_list(raw_billing_docs);
        return billing_documents

    async def get_partners(self, customer_price_group: Optional[str] = None) -> List[Dict[str, str]]:
        partners_set = set()

        billing_documents = await self.fetch_billing_documents_from_sap(customer_price_group)
        
        for billing_document in billing_documents:
            raw_items = billing_document['to_Item']['A_BillingDocumentItemType']
            items = self.normalize_list(raw_items)
            for item in items:
                partner_info = item['to_Partner']['A_BillingDocumentItemPartnerType']
                partner_tuple = (partner_info['Personnel'], partner_info['FullName'])
                partners_set.add(partner_tuple) 
        partners = [{"personnel_number": personnel_number, "full_name": full_name} for personnel_number, full_name in partners_set]
        return partners
        


