from fastapi import Depends
from sqlalchemy.orm import Session
from app.database import get_db
from .sap_api_service import SAPApiService
from .sap_odata_service import SAPODataService
from .legacy_system_service import LegacySystemService
from .partner_catalog_service import PartnerCatalogService
from .factura_tracking_service import BillingDocumentTrackingService
from .partner_commission_configuration_service import PartnerCommissionConfigurationService
from .corte_mensual_service import MonthlyCutService
from .comisiones_service import CommissionsService

def get_sap_api_service() -> SAPApiService:
    return SAPApiService()

def get_sap_odata_service() -> SAPODataService:
    return SAPODataService()

def get_legacy_system_service() -> LegacySystemService:
    return LegacySystemService()

def get_partner_commission_configuration_service(
    db: Session = Depends(get_db),
) -> PartnerCommissionConfigurationService:
    return PartnerCommissionConfigurationService(db)

def get_partner_catalog_service(
    sap_api_service: SAPApiService = Depends(get_sap_api_service)
) -> PartnerCatalogService:
    return PartnerCatalogService(sap_api_service)

def get_billing_doc_tracking_service(
    db: Session = Depends(get_db),
    legacy_system: LegacySystemService = Depends(get_legacy_system_service)
) -> BillingDocumentTrackingService:
    return BillingDocumentTrackingService(db, legacy_system) 

def get_monthly_cut_service(
    db: Session = Depends(get_db),
) -> MonthlyCutService:
    return MonthlyCutService(db)

def get_comisiones_service(
    monthly_cut_service: MonthlyCutService = Depends(get_monthly_cut_service),
    billing_doc_tracking_service: BillingDocumentTrackingService = Depends(get_billing_doc_tracking_service),
    sap_api_service: SAPApiService = Depends(get_sap_api_service),
    sap_odata_service: SAPODataService = Depends(get_sap_odata_service)
) -> CommissionsService:
    return CommissionsService(monthly_cut_service, billing_doc_tracking_service, sap_api_service, sap_odata_service) 