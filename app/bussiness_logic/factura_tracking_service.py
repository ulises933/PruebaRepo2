from typing import Dict, List, Tuple
from sqlalchemy.orm import Session
from .db_models import FacturaTracking, EstatusFactura
from .legacy_system_service import LegacySystemService
from datetime import datetime, UTC

from app.exception import BillingDocumentDoesNotExistError

class FacturaTrackingService:
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
    
    def obtener_facturas_comisionables(self) -> List[FacturaTracking]:
        return self.db.query(FacturaTracking).order_by(FacturaTracking.id_corte.desc(),FacturaTracking.id.asc()).all()

    def obtener_facturas_comisionables_por_id_corte(self, id_corte: int) -> List[FacturaTracking]:
        #TODO: decidir si se muestran solo facturas pagables en periodos pasados
        return self.db.query(FacturaTracking).filter_by(id_corte=id_corte).all()

    def actualizar_estado_factura(self, id: int, estatus: EstatusFactura, usuario: str) -> FacturaTracking:
        factura = self.db.query(FacturaTracking).get(id)

        if not factura:
            raise BillingDocumentDoesNotExistError(id)
        else:
            factura.estatus = estatus
            factura.usuario_marcado = usuario
            factura.fecha_marcado = datetime.now(UTC)
            factura.detalle_comision = "Estado actualizado manualmente"
        
        self.db.commit()
        return factura
    
#    def actualizar_estado_facturas(self, ids:[int], estatus: EstatusFactura, usuario: str) -> List[FacturaTracking]:
#        # Actualizar el estado de todas las facturas en una sola consulta
#        self.db.query(FacturaTracking).filter(FacturaTracking.id.in_(ids)).update({
#            FacturaTracking.estatus: nuevo_estatus,
#            FacturaTracking.usuario_marcado: usuario
#        }, synchronize_session=False)
#        self.db.commit()
#         updated_facturas = self.db.query(FacturaTracking).filter(FacturaTracking.id.in_(ids)).all()
#        return updated_facturas
  
    async def procesar_factura(self, factura_sap: Dict, usuario: str, id_corte: int) -> FacturaTracking:
        """Procesa una factura de SAP verificando primero el tracking local"""
        billing_document = factura_sap["BillingDocument"]
        # Verificar si ya existe en tracking
        factura_tracking = self.db.query(FacturaTracking).filter_by(billing_document=billing_document).first()
        
        # Extraer materiales (artículos)
        materiales = []
        if isinstance(factura_sap["to_Item"]["A_BillingDocumentItemType"], list):
            materiales = [item["Material"] for item in factura_sap["to_Item"]["A_BillingDocumentItemType"]]
        else:
            materiales = [factura_sap["to_Item"]["A_BillingDocumentItemType"]["Material"]]
        
        # Calcular comisiones
        articulos_comisionables, total_comision = await self.calcular_comisiones(materiales)
        
        if factura_tracking:
            # Actualizar la factura existente
            factura_tracking.importe_comision = total_comision
            factura_tracking.detalle_comision = ""
            factura_tracking.articulos=articulos_comisionables,
            factura_tracking.id_corte = id_corte
            self.db.commit()
            return factura_tracking
        else:
            personnel_number = self._get_agent(factura_sap)
            # Crear un nuevo tracking
            nuevo_tracking = FacturaTracking(
                billing_document=billing_document,
                importe_total=factura_sap["TotalAmount"],
                estatus=EstatusFactura.PAGABLE,
                personnel_number=personnel_number,
                usuario_marcado=usuario,
                detalle_comision="",
                articulos=articulos_comisionables,
                importe_comision=total_comision,
                id_corte=id_corte
            )
            
            self.db.add(nuevo_tracking)
            self.db.commit()
            
            return nuevo_tracking
    
    async def calcular_comisiones(self, materiales: List[str]) -> Tuple[Dict[str, float], float]:
        """Calcula las comisiones para los artículos y retorna los comisionables y el total"""
        articulos_comisionables = await self.legacy_system_service.consultar_articulos_comisionables(materiales)
        
        total_comision = sum(item["comision"] for item in articulos_comisionables.values())
        return articulos_comisionables, total_comision
