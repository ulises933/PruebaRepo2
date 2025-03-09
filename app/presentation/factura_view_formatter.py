from typing import Dict, List
from datetime import datetime
from app.utils.billing_document_utils import get_partner_info

class FacturaViewFormatter:
    @staticmethod
    def _get_vendedor(billing_document: Dict) -> str:
        """Extrae el nombre del vendedor de la estructura de la factura"""
        return get_partner_info(billing_document, lambda partner: partner["FullName"])

    @staticmethod
    def format_for_view(factura_sap: Dict, tracking_data: Dict) -> Dict:
        """Formatea una factura para la vista"""
        return {
            "id": factura_sap["BillingDocument"],
            "fecha": factura_sap["BillingDocumentDate"].split("T")[0],
            "importe": float(factura_sap["TotalNetAmount"]),
            "vendedor": FacturaViewFormatter._get_vendedor(factura_sap),
            "estado": "Pendiente",
            "comisionable": tracking_data.comisionable
        }

    @staticmethod
    async def format_facturas_list(facturas_sap: List[Dict], tracking_data_list: List[Dict]) -> List[Dict]:
        """Formatea una lista de facturas para la vista"""
        tracking_dict = {t.billing_document: t for t in tracking_data_list}
        
        return [
            FacturaViewFormatter.format_for_view(factura, tracking_dict[factura["BillingDocument"]])
            for factura in facturas_sap["A_BillingDocumentType"]
        ] 