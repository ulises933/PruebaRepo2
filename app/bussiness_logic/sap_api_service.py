from typing import Dict
import aiohttp
from app.env_variables import SAP_API_KEY, SAP_API_URL
from datetime import datetime, timedelta
import logging
from typing import Optional
from app.bussiness_logic.mock_facturas import mock_facturas_01, mock_facturas_08

class SAPApiService:
    def __init__(self):
        self.api_key = SAP_API_KEY
        self.api_url = SAP_API_URL
    
    @staticmethod
    def compute_date_range(year, month):
        start_date = datetime(year, month, 1)
        end_date = datetime(year, month + 1, 1) - timedelta(microseconds=1)
        
        # Formatear las fechas
        start_str = start_date.strftime("%Y-%m-%dT%H:%M:%S")
        end_str = end_date.strftime("%Y-%m-%dT%H:%M:%S")
        
        return {"start": start_str, "end": end_str}
        
    async def get_billing_documents(self, year: int, month: int, personnel_number: str, customer_price_group: str, language: Optional[str] = "EN") -> Dict:
        """Gets billing documents from SAP"""
        date_range = self.compute_date_range(year, month)
        
        headers = {
            "x-api-key": self.api_key
        }
        
        payload = {
            "CustomerPriceGroup": customer_price_group, # TODO: obtener CustomerPriceGroup de Wiremax
            "StartDate": date_range["start"],
            "FinishDate": date_range["end"],
            "PersonnelNumber": personnel_number,
            "Language": language
        }

        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(self.api_url, 
                                     headers=headers, 
                                     json=payload) as response:
                    if response.status == 200:
                        json_response = await response.json()
                        res = json_response.get("data")
                        return res
                    else:
                        logging.error(f"Error when retrieving billing documents from SAP: {response.status}")
                        logging.info(f"Response: {await response.text()}")
                        return self.get_mock_facturas(customer_price_group)
        except Exception as e: # TODO: raise the exception when done testing
            logging.error(f"Exception when trying to obtain billing documents from SAP: {str(e)}")
            return self.get_mock_facturas(customer_price_group)

    def get_mock_facturas(self, customer_price_group) -> Dict:
        """Returns a mock list of billing documents as a fallback"""
        mock = {}
        if customer_price_group=="01":
            mock = mock_facturas_01
        elif customer_price_group=="08":
            mock = mock_facturas_08
        else:
            mock = {
                "A_BillingDocumentType": mock_facturas_01["A_BillingDocumentType"] + mock_facturas_08["A_BillingDocumentType"]
            }        
        return mock
