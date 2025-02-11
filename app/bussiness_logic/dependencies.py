from fastapi import Depends
from sqlalchemy.orm import Session
from app.database import get_db
from .sap_api_service import SAPApiService
from .sap_odata_service import SAPODataService
from .legacy_system_service import LegacySystemService
from .factura_tracking_service import FacturaTrackingService

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