from typing import Dict, List, Tuple, Optional
from sqlalchemy.orm import Session
from .db_models import BillingDocumentTracking, BillingDocumentStatus
from .legacy_system_service import LegacySystemService
from datetime import datetime, UTC
from sqlalchemy import text, func

from app.exception import BillingDocumentDoesNotExistError
from app.utils.billing_document_utils import get_partner_info
from app.utils.normalize_tools import normalize_list

class BillingDocumentTrackingService:
    def __init__(self, db: Session, legacy_system_service: LegacySystemService):
        self.db = db
        self.legacy_system_service = legacy_system_service

    @staticmethod
    def _get_agent(billing_document: Dict) -> str:
        """Obtains the personnel number from the items in the billing document"""
        return get_partner_info(billing_document, lambda partner: (partner["Personnel"],partner["FullName"]))
    
    def get_billing_documents(self) -> List[BillingDocumentTracking]:
        return self.db.query(BillingDocumentTracking).order_by(BillingDocumentTracking.monthly_cut_id.desc(),BillingDocumentTracking.id.asc()).all()

    def get_billing_documents_by_monthly_cut_id(self, monthly_cut_id: int) -> List[BillingDocumentTracking]:
        #TODO: decidir si se muestran solo billing_documents pagables en periodos pasados
        return self.db.query(BillingDocumentTracking).filter_by(monthly_cut_id=monthly_cut_id).all()

    def update_billing_document_status(self, id: int, status: BillingDocumentStatus, penalty_amount: float, user: str) -> BillingDocumentTracking:
        billing_doc = self.db.query(BillingDocumentTracking).get(id)

        if not billing_doc:
            raise BillingDocumentDoesNotExistError(id)
        else:
            billing_doc.status = status
            billing_doc.penalty_amount = penalty_amount
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
  
    async def process_billing_document(self, sap_billing_doc: Dict, customer_price_group: str, user: str, monthly_cut_id: int) -> BillingDocumentTracking:
        """Process a SAP billing document and verifies the local tracking"""
        billing_document = sap_billing_doc["BillingDocument"]
        # Verify if the billing doc already exists in the local tracking
        billing_doc_tracking = self.db.query(BillingDocumentTracking).filter_by(billing_document=billing_document).first()
        
        # Extract materials (items)
        items = normalize_list(sap_billing_doc["to_Item"]["A_BillingDocumentItemType"])
        parsed_items = [{
            "material":item["Material"],
            "description":item["MaterialDescription"],
            "price": item.get("Amount",float(sap_billing_doc["TotalAmount"])/len(items)),
            "group1": item["ProductHierarchy"][0:3],
            "group2": item["ProductHierarchy"][3:7],
        } for item in items]
        if billing_doc_tracking:
            return billing_doc_tracking
        else:
            personnel_number, full_name = self._get_agent(sap_billing_doc)
            # Crear un nuevo tracking
            new_tracking = BillingDocumentTracking(
                billing_document=billing_document,
                total_amount=sap_billing_doc["TotalAmount"],
                status=BillingDocumentStatus.PAYABLE,
                personnel_number=personnel_number,
                partner_full_name=full_name,
                last_modified_user=user,
                commission_detail="",
                items=parsed_items,
                commission_amount=0,
                customer_price_group=customer_price_group,
                monthly_cut_id=monthly_cut_id
            )
            self.db.add(new_tracking)
            self.db.commit()
            return new_tracking
    
    async def calculate_commissions(self, monthly_cut_id: int, customer_price_group: str, user_mod: Optional[str] = "system"):
        """
        Updates the billing document tracking records with the calculated comissions for a given monthly_cut_id and customer_price_group.
        
        Args:
            monthly_cut_id: Monthly cut ID
            customer_price_group: Customer price group that references a specific brand
        """
        sql_query = text("""
        WITH 
        docs_to_update AS (
            SELECT 
                id, 
                items, 
                personnel_number, 
                customer_price_group, 
                penalty_amount
            FROM 
                billing_document_tracking
            WHERE 
                monthly_cut_id = :monthly_cut_id 
                AND customer_price_group = :customer_price_group
        ),

        items_with_commission AS (
            SELECT 
                d.id,
                json_group_array(
                    CASE
                        WHEN icc.id IS NOT NULL THEN
                            json_set(
                                json_set(
                                    json_each.value, 
                                    '$.item_commission_percent', 
                                    icc.commission_percent
                                ),
                                '$.commission_amount', 
                                CAST(json_extract(json_each.value, '$.price') AS FLOAT) * icc.commission_percent / 100.0 
                            )
                        WHEN pcc.id IS NOT NULL THEN
                            json_set(
                                json_set(
                                    json_each.value, 
                                    '$.partner_commission_percent', 
                                    CAST(pcc.commission_percent AS TEXT)
                                ),
                                '$.commission_amount', 
                                CAST(json_extract(json_each.value, '$.price') AS FLOAT) * pcc.commission_percent / 100.0
                            )
                        ELSE
                            json_set(
                                json_set(
                                    json_each.value, 
                                    '$.partner_commission_percent', 
                                    0.0
                                ),
                                '$.commission_amount', 
                                0.0
                            )
                    END
                ) AS updated_items
            FROM 
                docs_to_update d,
                json_each(d.items)
            LEFT JOIN 
                item_commission_configuration AS icc 
                ON icc.group1 = json_extract(json_each.value, '$.group1') 
                AND (icc.group2 IS NULL OR icc.group2 = json_extract(json_each.value, '$.group2')) 
                AND icc.customer_price_group = d.customer_price_group
            LEFT JOIN 
                partner_commission_configuration AS pcc 
                ON pcc.personnel_number = d.personnel_number 
                AND pcc.customer_price_group = d.customer_price_group
            GROUP BY 
                d.id
        ),

        commission_totals AS (
            SELECT 
                i.id,
                i.updated_items,
                COALESCE(SUM(CAST(json_extract(json_each.value, '$.commission_amount') AS FLOAT)), 0) AS total_commission
            FROM 
                items_with_commission i,
                json_each(i.updated_items)
            GROUP BY 
                i.id, i.updated_items
        )

        UPDATE billing_document_tracking
        SET 
            items = c.updated_items,
            commission_amount = c.total_commission,
            --total_amount = c.total_commission - penalty_amount,
            last_modified_date = CURRENT_TIMESTAMP,
            last_modified_user = :user
        FROM 
            commission_totals c
        WHERE 
            billing_document_tracking.id = c.id;
        """)
        result = self.db.execute(
            sql_query, 
            {
                "monthly_cut_id": monthly_cut_id, 
                "customer_price_group": customer_price_group,
                "user": user_mod
            }
        )
        self.db.commit()

    def get_total_commissions_by_personnel(
        self, 
        monthly_cut_id: int, 
        customer_price_group: str
    ) -> List[Dict]:
        """
        Gets the total sum of commissions grouped by personnel_number for a given monthly_cut_id and customer_price_group.
        
        Args:
            monthly_cut_id: Monthly cut ID
            customer_price_group: Customer price group that references a specific brand
            
        Returns:
            List[Dict]: List of dictionaries with the personnel_number and total_commission
        """
        results = self.db.query(
            BillingDocumentTracking.personnel_number,
            BillingDocumentTracking.partner_full_name,
            func.sum(BillingDocumentTracking.commission_amount).label('total_commission'),
            func.sum(BillingDocumentTracking.penalty_amount).label('total_penalty')
        ).filter(
            BillingDocumentTracking.monthly_cut_id == monthly_cut_id,
            BillingDocumentTracking.customer_price_group == customer_price_group,
            BillingDocumentTracking.status == BillingDocumentStatus.PAYABLE
        ).group_by(
            BillingDocumentTracking.personnel_number
        ).order_by(
            func.sum(BillingDocumentTracking.commission_amount).desc()
        ).all()
        
        return [
            {
                'personnel_number': row.personnel_number,
                'full_name': row.partner_full_name,
                'total_commission': row.total_commission,
                'total_penalty': row.total_penalty,
                'net_commission': row.total_commission - row.total_penalty,
            }
            for row in results
        ]
