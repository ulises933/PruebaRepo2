from app.env_variables import SAP_ODATA_URL, SAP_ODATA_CLIENT_ID, SAP_ODATA_CLIENT_SECRET
import base64
from typing import List, Dict
from datetime import datetime, UTC
import aiohttp
from app.bussiness_logic.db_models import BillingDocumentTracking

class SAPODataService:
    def __init__(self):
        self.api_url = SAP_ODATA_URL
        self.client_id = SAP_ODATA_CLIENT_ID
        self.client_secret = SAP_ODATA_CLIENT_SECRET
        self.token = self.generate_token()

    def generate_token(self) -> str:
        """Generates the authentication token using a client id and a client secret"""
        credentials = f"{self.client_id}:{self.client_secret}"
        token = base64.b64encode(credentials.encode()).decode()
        return token

    async def send_invoice_to_sap(self, comissions_by_partner: List[Dict], user: str):
        """Sends commission imports by agent to SAP"""
        json_data = self.build_json_body(comissions_by_partner, user)
        response = await self.make_request_call(json_data)
        return response

    async def make_request_call(self, json_data: Dict):
        """Builds a journal entry to be sent using SAP's API"""
        url = self.api_url
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Basic {self.token}"
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=json_data, headers=headers) as response:
                #TODO: raise_for_status when done testing
                if response.status == 200:
                    json_response = await response.json()
                    return json_response.get("data")
                else:
                    text = await response.text()
                    return text
                      

    def build_json_body(self, data: List[Dict], user) -> Dict:
        
        original_reference_document_type = "BKPFF"
        business_transaction_type = "RFBU"
        accounting_document_type = "KR"
        document_reference_id = "123456"
        document_header_text = "Cierre de Corte"
        created_by_user = user
        
        company_code = "1001"
        currency_code = "USD"
        debit_credit_code = "S"

        gl_account = "0063009000"
        tax_code = "V2"
        acc_assignment_type = "EO"
        profit_center = "100100"
        cost_center = "1001004007"

        items = []
        for tracking in data:
            items.append({
                "ReferenceDocumentItem": tracking.billing_document,
                "GLAccount": gl_account,
                "AmountInTransactionCurrency": tracking.commission_amount,
                "CurrencyCode": currency_code,
                "DebitCreditCode": debit_credit_code,
                "DocumentItemText": f"Comisión para {tracking.billing_document}",
                "Tax":{
						"TaxCode": tax_code
					},
					"AccountAssignment":{
						"AccountAssignmentType": acc_assignment_type,
						"ProfitCenter": profit_center,
						"CostCenter": cost_center
					}
            })
        
        return {
            "JournalEntryCreateRequest": {
                "JournalEntry": {
                    "OriginalReferenceDocumentType": original_reference_document_type,
                    "BusinessTransactionType": business_transaction_type,
                    "AccountingDocumentType": accounting_document_type,
                    "DocumentReferenceID": document_reference_id,
                    "DocumentHeaderText": document_header_text,
                    "CreatedByUser": created_by_user,
                    "CompanyCode": company_code,
                    "DocumentDate": datetime.now(UTC).isoformat(),
                    "PostingDate": datetime.now(UTC).isoformat(),
                    "Item": items,
                    # TODO: Check if other items are mandatory
                }
            }
        }
