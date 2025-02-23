from app.bussiness_logic.db_models import FacturaTracking, EstatusCorte
from app.bussiness_logic.factura_tracking_service import FacturaTrackingService
from app.bussiness_logic.corte_mensual_service import CorteMensualService
from app.bussiness_logic.sap_odata_service import SAPODataService
from app.bussiness_logic.sap_api_service import SAPApiService
from typing import List, Dict

from app.exception import BillingDocumentOutOfBillingCycleError, BillingDocumentDoesNotExistError, BillingCycleDoesNotExistError

class ComisionesService:
    def __init__(self,corte_service: CorteMensualService, factura_service: FacturaTrackingService, sap_api_service: SAPApiService, sap_odata_service: SAPODataService):
        self.corte_service = corte_service
        self.factura_service = factura_service
        self.sap_api_service = sap_api_service
        self.sap_odata_service = sap_odata_service

    async def obtener_facturas(self, anio: int, mes: int, personnel_number: str) -> List[FacturaTracking]:
        """Obtiene las facturas según el estado del corte"""
        corte = await self.corte_service.obtener_corte_por_periodo(anio, mes)
        if corte.estatus == EstatusCorte.ABIERTO:
            # Consultar facturas de SAP
            facturas_sap = await self.sap_api_service.get_facturas(anio, mes, personnel_number)
            # Procesar facturas en el tracking
            tracking_data = []
            for factura in facturas_sap["A_BillingDocumentType"]:
                if factura["BillingDocumentStatus"] == "Completed" and factura["InvoiceIsClearing"] == 'false':
                    tracking = await self.factura_service.procesar_factura(factura, "usuario_test", corte.id)
                    tracking_data.append(tracking)
            return tracking_data
        elif corte.estatus == EstatusCorte.CERRADO:
            # Usar el tracking local
            return self.factura_service.obtener_facturas_comisionables_por_id_corte(corte.id)
        else:
            raise Exception 

    async def actualizar_estatus_facturas(self, facturas: List[FacturaTracking], user: str):
        corte_en_curso = self.corte_service.obtener_corte_actual()
        if not corte_en_curso:
            raise BillingCycleDoesNotExistError(message="No billing cycle has been created yet. Billing documents that are not associated with a billing cycle cannot be modified.")
        #se verifica que todas las facturas pertenezcan al corte actual
        for factura in facturas:
            if corte_en_curso.id != factura.id_corte:
                raise BillingDocumentOutOfBillingCycleError(factura.id)
        for factura in facturas:
            self.factura_service.actualizar_estado_factura(
                factura.id,
                factura.estatus,
                user
            )

    async def cerrar_corte(self, year: int, month: int, user) -> Dict:
        """Envía la información a SAP y cierra el corte"""
        
        facturas_procesadas = await self.obtener_facturas(year, month, 0)
        
        response = await self.sap_odata_service.create_journal_entry(facturas_procesadas, user)
        await self.corte_service.cerrar_corte(year,month,user)
        
        return response