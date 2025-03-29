from app.bussiness_logic.factura_tracking_service import BillingDocumentTrackingService
from app.bussiness_logic.sap_api_service import SAPApiService
from sqlalchemy.orm import Session
from app.env_variables import SAP_API_KEY, HIERARCHY_API_URL, ITEM_API_URL
import aiohttp
from app.utils.normalize_tools import normalize_list
import logging
from datetime import datetime
from typing import List, Dict, Optional
from .db_models import ItemGroup

class ItemCatalogService:
    GROUP_LEVEL_SELECTOR = {
        1: (0, 3),
        2: (3, 7),
        3: (7, 12),
        4: (12,18)
    }
    def __init__(self, db: Session, sap_api_service: SAPApiService):
        self.db = db
        self.sap_api_service = sap_api_service
        self.api_key = SAP_API_KEY
        self.item_api_url = ITEM_API_URL

    async def fetch_billing_documents_from_sap(self, customer_price_group: str = "") -> List[Dict]:
        current_date = datetime.now()
        current_year, current_month = current_date.year, current_date.month
        #When 0, personnel_number filter takes no effect.
        personnel_number = 0
        billing_docs_response = await self.sap_api_service.get_billing_documents(current_year, current_month, personnel_number, customer_price_group)
        raw_billing_docs = billing_docs_response.get('A_BillingDocumentType')
        billing_documents = normalize_list(raw_billing_docs);
        return billing_documents
       

    async def fetch_items(self, customer_price_group: Optional[str] = None) -> List[Dict]:
        headers = {
            "x-api-key": self.api_key
        }
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(self.item_api_url, 
                                     headers=headers, 
                                     #json=payload
                                     ) as response:
                    if response.status == 200:
                        json_response = await response.json()
                        res = json_response.get("data")
                        return res
                    else:
                        logging.error(f"Error when retrieving items from SAP: {response.status}")
                        logging.info(f"Response: {await response.text()}")
                        return self.get_mock_items()
        except Exception as e: # TODO: raise the exception when done testing
            logging.error(f"Exception when retrieving items from SAP: {str(e)}")
            return self.get_mock_items()

    def get_mock_items(self) -> Dict:
        """Returns a mock list of items as a fallback"""
        return {}

    def get_item_groups(self, level:int, parent_code: Optional[str]=None) -> List[Dict[str, str]]:
        filters = {"hierarchy_level":level}
        if level == 2 and parent_code is not None:
            filters["parent_code"]=parent_code
        item_groups = self.db.query(ItemGroup).filter_by(**filters).order_by(ItemGroup.code)
        return item_groups

    async def get_items_in_group(self, group1:str, group2:Optional[str]=None, language: Optional[str]= "EN") -> List[Dict[str,str]]:
        hierarchy = f"{group1}{group2 if group2 is not None else ''}"
        #items = await self.fetch_items()
        #filtered_items = [
        #    item
        #    for item in items
        #    if item.ProductHierarchy.startswith(hierarchy) and item.Language == language
        #]
        items_set = set()
        billing_documents = await self.fetch_billing_documents_from_sap()

        for billing_document in billing_documents:
            raw_items = billing_document['to_Item']['A_BillingDocumentItemType']
            items = normalize_list(raw_items)
            for item in items:
                productHierarchy = item['ProductHierarchy']
                if productHierarchy.startswith(hierarchy):
                    item_group1 = productHierarchy[slice(*self.GROUP_LEVEL_SELECTOR[1])]
                    item_group2 = productHierarchy[slice(*self.GROUP_LEVEL_SELECTOR[2])]
                    item_name = item["Material"]
                    item_description = item["MaterialDescription"]
                    item_tuple = (item_name, item_description, item_group1, item_group2)
                    items_set.add(item_tuple)
        unique_items = [{"name": name, "description": description, "group1":group1, "group2":group2} for name, description, group1, group2 in items_set]
        return unique_items

        


