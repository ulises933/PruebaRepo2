from typing import Dict, List, Tuple
from sqlalchemy.orm import Session
from .db_models import BillingDocumentTracking, BillingDocumentStatus
from .legacy_system_service import LegacySystemService
from datetime import datetime, UTC

from app.exception import BillingDocumentDoesNotExistError

class BillingDocumentTrackingService:
    def __init__(self, db: Session, legacy_system_service: LegacySystemService):
        self.db = db
        self.legacy_system_service = legacy_system_service

    @staticmethod
    def _get_agent(factura_sap: Dict) -> str:
        """Obtains the personnel number from the items in the billing document"""
        item_type = factura_sap["to_Item"]["A_BillingDocumentItemType"]
        if isinstance(item_type, dict):
            partner = item_type["to_Partner"]["A_BillingDocumentItemPartnerType"]
        else:
            partner = item_type[0]["to_Partner"]["A_BillingDocumentItemPartnerType"]
        return partner["Personnel"]
    
    def get_billing_documents(self) -> List[BillingDocumentTracking]:
        return self.db.query(BillingDocumentTracking).order_by(BillingDocumentTracking.monthly_cut_id.desc(),BillingDocumentTracking.id.asc()).all()

    def get_billing_documents_by_monthly_cut_id(self, monthly_cut_id: int) -> List[BillingDocumentTracking]:
        #TODO: decidir si se muestran solo billing_documents pagables en periodos pasados
        return self.db.query(BillingDocumentTracking).filter_by(monthly_cut_id=monthly_cut_id).all()

    def update_billing_document_status(self, id: int, status: BillingDocumentStatus, user: str) -> BillingDocumentTracking:
        billing_doc = self.db.query(BillingDocumentTracking).get(id)

        if not billing_doc:
            raise BillingDocumentDoesNotExistError(id)
        else:
            billing_doc.status = status
            billing_doc.last_modified_user = user
            billing_doc.last_modified_date = datetime.now(UTC)
            billing_doc.commission_detail = "status updated successfully"
        
        self.db.commit()
        return billing_doc
    
#    def actualizar_estado_facturas(self, ids:[int], status: BillingDocumentStatus, usuario: str) -> List[BillingDocumentTracking]:
#        # Actualizar el estado de todas las billing_documents en una sola consulta
#        self.db.query(BillingDocumentTracking).filter(BillingDocumentTracking.id.in_(ids)).update({
#            BillingDocumentTracking.status: nuevo_estatus,
#            BillingDocumentTracking.last_modified_user: usuario
#        }, synchronize_session=False)
#        self.db.commit()
#         updated_facturas = self.db.query(BillingDocumentTracking).filter(BillingDocumentTracking.id.in_(ids)).all()
#        return updated_facturas
  
    async def process_billing_document(self, sap_billing_doc: Dict, user: str, monthly_cut_id: int) -> BillingDocumentTracking:
        """Process a SAP billing document and verifies the local tracking"""
        billing_document = sap_billing_doc["BillingDocument"]
        # Verify if the billing doc already exists in the local tracking
        billing_doc_tracking = self.db.query(BillingDocumentTracking).filter_by(billing_document=billing_document).first()
        
        # Extract materials (items)
        materials = []
        if isinstance(sap_billing_doc["to_Item"]["A_BillingDocumentItemType"], list):
            materials = [item["Material"] for item in sap_billing_doc["to_Item"]["A_BillingDocumentItemType"]]
        else:
            materials = [sap_billing_doc["to_Item"]["A_BillingDocumentItemType"]["Material"]]
        
        # Calculate commissions
        commissionable_items, total_commission = await self.calculate_commissions(materials)
        
        if billing_doc_tracking:
            # Update if already exist
            billing_doc_tracking.commission_amount = total_commission
            billing_doc_tracking.commission_detail = ""
            billing_doc_tracking.items=commissionable_items,
            billing_doc_tracking.monthly_cut_id = monthly_cut_id
            self.db.commit()
            return billing_doc_tracking
        else:
            personnel_number = self._get_agent(sap_billing_doc)
            # Crear un nuevo tracking
            new_tracking = BillingDocumentTracking(
                billing_document=billing_document,
                total_amount=sap_billing_doc["TotalAmount"],
                status=BillingDocumentStatus.PAYABLE,
                personnel_number=personnel_number,
                last_modified_user=user,
                commission_detail="",
                items=commissionable_items,
                commission_amount=total_commission,
                monthly_cut_id=monthly_cut_id
            )
            
            self.db.add(new_tracking)
            self.db.commit()
            
            return new_tracking
    
    async def calculate_commissions(self, materials: List[str]) -> Tuple[Dict[str, float], float]:
        """Calculates the commission for each item and returns commissionable items and the total"""
        commissionable_items = await self.legacy_system_service.get_commissionable_items(materials)
        
        total_commission = sum(item["comision"] for item in commissionable_items.values())
        return commissionable_items, total_commission
