from typing import Dict
from sqlalchemy.orm import Session
from .db_models import FacturaTracking
from .legacy_system_service import LegacySystemService
from datetime import datetime

class FacturaTrackingService:
    def __init__(self, db: Session, legacy_system_service: LegacySystemService):
        self.db = db
        self.legacy_system_service = legacy_system_service

    def actualizar_estado_factura(self, billing_document: str, comisionable: bool, usuario: str) -> FacturaTracking:
        factura = self.db.query(FacturaTracking).filter_by(billing_document=billing_document).first()
        
        if not factura:
            factura = FacturaTracking(
                billing_document=billing_document,
                comisionable=comisionable,
                usuario_marcado=usuario,
                detalle_comision="Estado actualizado manualmente"
            )
            self.db.add(factura)
        else:
            factura.comisionable = comisionable
            factura.usuario_marcado = usuario
            factura.fecha_marcado = datetime.utcnow()
            factura.detalle_comision = "Estado actualizado manualmente"
        self.db.commit()
        return factura

    async def procesar_factura(self, factura_sap: Dict, usuario: str) -> FacturaTracking:
        """Procesa una factura de SAP verificando primero el tracking local"""
        billing_document = factura_sap["BillingDocument"]
        
        # Verificar si ya existe en tracking
        factura_tracking = self.db.query(FacturaTracking).filter_by(
            billing_document=billing_document
        ).first()
        
        if factura_tracking:
            return factura_tracking
            
        # Extraer materiales (artículos)
        materiales = []
        if isinstance(factura_sap["to_Item"]["A_BillingDocumentItemType"], list):
            materiales = [item["Material"] for item in factura_sap["to_Item"]["A_BillingDocumentItemType"]]
        else:
            materiales = [factura_sap["to_Item"]["A_BillingDocumentItemType"]["Material"]]
        
        # Consultar directamente al sistema legado
        articulos_comisionables = await self.legacy_system_service.consultar_articulos_comisionables(materiales)
        es_comisionable = any(articulos_comisionables.values())
        
        nuevo_tracking = FacturaTracking(
            billing_document=billing_document,
            comisionable=es_comisionable,
            usuario_marcado=usuario,
            detalle_comision=f"Artículos comisionables: {[m for m, c in articulos_comisionables.items() if c]}"
        )
        
        self.db.add(nuevo_tracking)
        self.db.commit()
        
        return nuevo_tracking