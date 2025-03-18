from app.bussiness_logic.db_models import BillingDocumentTracking, MonthlyCutStatus
from app.bussiness_logic.factura_tracking_service import BillingDocumentTrackingService
from app.bussiness_logic.corte_mensual_service import MonthlyCutService
from app.bussiness_logic.sap_odata_service import SAPODataService
from app.bussiness_logic.sap_api_service import SAPApiService
from typing import List, Dict
import logging
from app.exception import BillingDocumentOutOfBillingCycleError, BillingDocumentDoesNotExistError, BillingCycleDoesNotExistError

class CommissionsService:
    def __init__(self,monthly_cut_service: MonthlyCutService, billing_doc_tracking_service: BillingDocumentTrackingService, sap_api_service: SAPApiService, sap_odata_service: SAPODataService):
        self.monthly_cut_service = monthly_cut_service
        self.billing_doc_tracking_service = billing_doc_tracking_service
        self.sap_api_service = sap_api_service
        self.sap_odata_service = sap_odata_service

    async def get_billing_documents(self, year: int, month: int, personnel_number: str, customer_price_group: str, language: str) -> List[BillingDocumentTracking]:
        """Gets the billing documents from a specific monthly_cut determined by the year and month"""
        monthly_cut = await self.monthly_cut_service.get_monthly_cut_by_period(year, month)
        tracking_data = []
        #If the specified period corresponds to an open monthly cut-off, it processes the billing documents from SAP, otherwise it returns the billing documents from local tracking.
        if monthly_cut.status == MonthlyCutStatus.OPEN:
            sap_billing_docs = await self.sap_api_service.get_billing_documents(year, month, personnel_number, customer_price_group, language)            
            if isinstance(sap_billing_docs["A_BillingDocumentType"], list):
                billing_docs = sap_billing_docs["A_BillingDocumentType"]
            else:
                billing_docs = [sap_billing_docs["A_BillingDocumentType"]]
            for billing_doc in billing_docs:
                #TODO: Todas las billing_docs del ambiente de dev tienen "InvoiceIsClearing"="false". Queremos que InvoiceIsClearing sea "true", pero lo dejaremos en false para poder testear en dev
                if billing_doc["BillingDocumentStatus"] == "Completed" and billing_doc["InvoiceIsClearing"] == 'false':
                    tracking = await self.billing_doc_tracking_service.process_billing_document(billing_doc, "usuario_test", monthly_cut.id)
                    tracking_data.append(tracking)
            return tracking_data
        elif monthly_cut.status == MonthlyCutStatus.CLOSED:
            tracking_data = self.billing_doc_tracking_service.get_billing_documents_by_monthly_cut_id(monthly_cut.id)
        return tracking_data

    def update_billing_document_status(self, billing_docs: List[BillingDocumentTracking], user: str):
        current_monthly_cut = self.monthly_cut_service.get_current_monthly_cut()
        if not current_monthly_cut:
            raise BillingCycleDoesNotExistError(message="No billing cycle has been created yet. Billing documents that are not associated with a billing cycle cannot be modified.")
        #All billing_docs are checked to ensure that they belong to the current monthly_cut
        for billing_doc in billing_docs:
            if current_monthly_cut.id != billing_doc.monthly_cut_id:
                raise BillingDocumentOutOfBillingCycleError(billing_doc.id)
        for billing_doc in billing_docs:
            self.billing_doc_tracking_service.update_billing_document_status(
                billing_doc.id,
                billing_doc.status,
                user
            )

    async def close_monthly_cut(self, year: int, month: int,  personnel_number: str, customer_price_group: str, language: str, user: str) -> Dict:
        """sends the calculated commissions to SAP and closes the monthly cut"""
        
        processed_bills = await self.get_billing_documents(year, month, personnel_number, customer_price_group, language)
        
        response = await self.sap_odata_service.send_invoice_to_sap(processed_bills, user)
        await self.monthly_cut_service.close_monthly_cut(year,month,user)
        
        return response