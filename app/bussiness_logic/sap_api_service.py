from typing import Dict, List
import aiohttp
from app.env_variables import SAP_API_KEY, SAP_API_URL, get_current_month_range

class SAPApiService:
    def __init__(self):
        self.api_key = SAP_API_KEY
        self.api_url = SAP_API_URL
        
    async def get_facturas(self) -> Dict:
        """Obtiene facturas usando la API REST de SAP"""
        date_range = get_current_month_range()
        
        headers = {
            "x-api-key": self.api_key
        }
        
        payload = {
            "StartDate": date_range["start"],
            "FinishDate": date_range["end"],
            "PersonnelNumber": 0
        }
        print(f"Payload: {payload}")
        print(f"Headers: {headers}")
        print(f"API URL: {self.api_url}")
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(self.api_url, 
                                     headers=headers, 
                                     json=payload) as response:
                    if response.status == 200:
                        return await response.json()
                    else:
                        print(f"Error al obtenerr facturas de SAP: {response.status}")
                        print(f"Response: {await response.text()}")
                        return self.get_mock_facturas()
        except Exception as e:
            print(f"Exception al obteneer facturas de SAP: {str(e)}")
            return self.get_mock_facturas()

    def get_mock_facturas(self) -> Dict:
        """Retorna datos mock para testing y fallback"""
        return {
            "A_BillingDocumentType": [
                {
                    "BillingDocument": "1000000222",
                    "BillingDocumentDate": "2025-01-02T00:00:00.000",
                    "TotalNetAmount": "13.26",
                    "TaxAmount": "0.00",
                    "to_Item": {
                        "A_BillingDocumentItemType": {
                            "BillingDocumentItem": "10",
                            "Material": "TG12",
                            "BillingDocumentItemText": "Trad.Good 12,Reorder Point,Reg.Trad.",
                            "to_Partner": {
                                "A_BillingDocumentItemPartnerType": {
                                    "Personnel": "00000008",
                                    "FullName": "Juan Pérez"
                                }
                            }
                        }
                    }
                },
                {
                    "BillingDocument": "1000000231",
                    "BillingDocumentDate": "2025-01-06T00:00:00.000",
                    "TotalNetAmount": "79.56",
                    "TaxAmount": "0.00",
                    "to_Item": {
                        "A_BillingDocumentItemType": [
                            {
                                "BillingDocumentItem": "10",
                                "Material": "TG13",
                                "BillingDocumentItemText": "Trad.Good 13",
                                "to_Partner": {
                                    "A_BillingDocumentItemPartnerType": {
                                        "Personnel": "00000008",
                                        "FullName": "Juanino Paolo"
                                    }
                                }
                            },
                            {
                                "BillingDocumentItem": "20",
                                "Material": "TG14",
                                "BillingDocumentItemText": "Trad.Good 14",
                                "to_Partner": {
                                    "A_BillingDocumentItemPartnerType": {
                                        "Personnel": "00000008",
                                        "FullName": "Juanino Paolo"
                                    }
                                }
                            }
                        ]
                    }
                }
            ]
        } 