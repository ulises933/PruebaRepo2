from typing import Dict
import aiohttp
from app.env_variables import SAP_API_KEY, SAP_API_URL
from datetime import datetime, timedelta
import logging

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
        
    async def get_billing_documents(self, year: int, month: int, personnel_number: str, customer_price_group: str, language: str) -> Dict:
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
                        return self.get_mock_facturas()
        except Exception as e: # TODO: raise the exception when done testing
            logging.error(f"Exception when trying to obtain billing documents from SAP: {str(e)}")
            return self.get_mock_facturas()

    def get_mock_facturas(self) -> Dict:
        """Returns a mock list of billing documents as a fallback"""
        return {
            "status": "success",
            "message": "Request processed successfully",
            "code": "200",
            "data": {
                "A_BillingDocumentType": [
                    {
                        "BillingDocument": "1000000222",
                        "BillingDocumentDate": "2025-01-02T00:00:00.000",
                        "TotalAmount": "13.26",
                        "CustomerPriceGroup": "08",
                        "BillingDocumentStatus": "Completed",
                        "InvoiceIsClearing": "false",
                        "to_Item": {
                            "A_BillingDocumentItemType": {
                                "BillingDocumentItem": "10",
                                "Material": "TG12",
                                "MaterialDescription": "Trad.Good 12,Reorder Point,Reg.Trad.",
                                "OldProductId": "",
                                "to_Partner": {
                                    "A_BillingDocumentItemPartnerType": {
                                        "Personnel": "00000008",
                                        "FullName": "PU ROlES SD"
                                    }
                                }
                            }
                        }
                    },
                    {
                        "BillingDocument": "1000000231",
                        "BillingDocumentDate": "2025-01-06T00:00:00.000",
                        "TotalAmount": "79.56",
                        "CustomerPriceGroup": "08",
                        "BillingDocumentStatus": "Canceled",
                        "InvoiceIsClearing": "false",
                        "to_Item": {
                            "A_BillingDocumentItemType": [
                                {
                                    "BillingDocumentItem": "10",
                                    "Material": "TG12",
                                    "MaterialDescription": "Trad.Good 12,Reorder Point,Reg.Trad.",
                                    "OldProductId": "",
                                    "to_Partner": {
                                        "A_BillingDocumentItemPartnerType": {
                                            "Personnel": "00000008",
                                            "FullName": "PU ROlES SD"
                                        }
                                    }
                                },
                                {
                                    "BillingDocumentItem": "20",
                                    "Material": "TG12",
                                    "MaterialDescription": "Trad.Good 12,Reorder Point,Reg.Trad.",
                                    "OldProductId": "",
                                    "to_Partner": {
                                        "A_BillingDocumentItemPartnerType": {
                                            "Personnel": "00000008",
                                            "FullName": "PU ROlES SD"
                                        }
                                    }
                                },
                                {
                                    "BillingDocumentItem": "30",
                                    "Material": "TG12",
                                    "MaterialDescription": "Trad.Good 12,Reorder Point,Reg.Trad.",
                                    "OldProductId": "",
                                    "to_Partner": {
                                        "A_BillingDocumentItemPartnerType": {
                                            "Personnel": "00000008",
                                            "FullName": "PU ROlES SD"
                                        }
                                    }
                                }
                            ]
                        }
                    },
                ],
            },
        } 