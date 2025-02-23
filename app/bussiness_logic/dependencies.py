from fastapi import Depends
from sqlalchemy.orm import Session
from app.database import get_db
from .sap_api_service import SAPApiService
from .sap_odata_service import SAPODataService
from .legacy_system_service import LegacySystemService
from .factura_tracking_service import FacturaTrackingService
from .corte_mensual_service import CorteMensualService
from .comisiones_service import ComisionesService

def get_sap_api_service() -> SAPApiService:
    return SAPApiService()

def get_sap_odata_service() -> SAPODataService:
    return SAPODataService()

def get_legacy_system_service() -> LegacySystemService:
    return LegacySystemService()

def get_factura_tracking_service(
    db: Session = Depends(get_db),
    legacy_system: LegacySystemService = Depends(get_legacy_system_service)
) -> FacturaTrackingService:
    return FacturaTrackingService(db, legacy_system) 

def get_corte_mensual_service(
    db: Session = Depends(get_db),
) -> CorteMensualService:
    return CorteMensualService(db)

def get_comisiones_service(
    corte_service: CorteMensualService = Depends(get_corte_mensual_service),
    factura_service: FacturaTrackingService = Depends(get_factura_tracking_service),
    sap_api_service: SAPApiService = Depends(get_sap_api_service),
    sap_odata_service: SAPODataService = Depends(get_sap_odata_service)
) -> ComisionesService:
    return ComisionesService(corte_service, factura_service, sap_api_service, sap_odata_service) 