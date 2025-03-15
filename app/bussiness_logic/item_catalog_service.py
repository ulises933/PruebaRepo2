from app.bussiness_logic.factura_tracking_service import BillingDocumentTrackingService
from app.bussiness_logic.sap_api_service import SAPApiService
from app.utils.normalize_tools import normalize_list
import logging
from datetime import datetime
from typing import List, Dict, Optional

class ItemCatalogService:
    GROUP_LEVEL_SELECTOR = {
        1: (0, 3),
        2: (3, 7),
        3: (7, 12),
        4: (12,18)
    }
    def __init__(self, sap_api_service: SAPApiService):
        self.sap_api_service = sap_api_service

    async def fetch_billing_documents_from_sap(self, customer_price_group: str = "") -> List[Dict]:
        current_date = datetime.now()
        current_year, current_month = current_date.year, current_date.month
        #When 0, personnel_number filter takes no effect.
        personnel_number = 0
        billing_docs_response = await self.sap_api_service.get_billing_documents(current_year, current_month, personnel_number, customer_price_group)
        raw_billing_docs = billing_docs_response.get('A_BillingDocumentType')
        billing_documents = normalize_list(raw_billing_docs);
        return billing_documents

    async def get_item_groups_1(self, customer_price_group: Optional[str] = None) -> List[Dict[str, str]]:
        data = await self.get_item_hierarchy_codes(customer_price_group=customer_price_group, level=1)
        return data
    
    async def get_item_groups_2(self, customer_price_group: Optional[str] = None) -> List[Dict[str, str]]:
        data = await self.get_item_hierarchy_codes(customer_price_group=customer_price_group, level=2)
        return data

    async def get_item_hierarchy_codes(self, level:int, customer_price_group: Optional[str] = None) -> List[Dict[str, str]]:
        codes_dict = {}

        billing_documents = await self.fetch_billing_documents_from_sap(customer_price_group)
        
        for billing_document in billing_documents:
            raw_items = billing_document['to_Item']['A_BillingDocumentItemType']
            items = normalize_list(raw_items)
            for item in items:
                start, end = self.GROUP_LEVEL_SELECTOR[level]
                code = item['ProductHierarchy'][start:end]
                desc = item['ProductHierarchyText']
                codes_dict[code] = desc
        codes = [{"code": key, "desc": value} for key, value in codes_dict.items()]
        return codes

    async def get_items_in_group(self, group1:str, group2:Optional[str]=None) -> List[Dict[str,str]]:
        items_set = set()
        billing_documents = await self.fetch_billing_documents_from_sap()
        for billing_document in billing_documents:
            raw_items = billing_document['to_Item']['A_BillingDocumentItemType']
            items = normalize_list(raw_items)
            for item in items:
                productHierarchy = item['ProductHierarchy']
                item_group1 = productHierarchy[slice(*self.GROUP_LEVEL_SELECTOR[1])]
                item_group2 = productHierarchy[slice(*self.GROUP_LEVEL_SELECTOR[2])]
                if group1 == item_group1 and (group2 == None or group2 == item_group2):
                    item_name = item["Material"]
                    item_description = item["MaterialDescription"]
                    item_tuple = (item_name, item_description, item_group1, item_group2)
                    items_set.add(item_tuple)
        unique_items = [{"name": name, "description": description, "group1":group1, "group2":group2} for name, description, group1, group2 in items_set]
        return unique_items

        


