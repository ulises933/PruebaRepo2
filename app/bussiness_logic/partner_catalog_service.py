from app.bussiness_logic.factura_tracking_service import BillingDocumentTrackingService
from app.bussiness_logic.sap_api_service import SAPApiService
from app.utils.normalize_tools import normalize_list
import logging
from datetime import datetime, UTC
from typing import List, Dict, Optional
from .db_models import Partner, Manager
from pydantic import BaseModel
from app.exception import PartnerDoesNotExistError


class PartnerData(BaseModel):
    id: int
    id_manager: int
    full_name: str
    payroll_number: str
    personnel_number: str
    company_code: str
    profit_center: str
    cost_center: str

class PartnerCatalogService:
    def __init__(self, db, sap_api_service: SAPApiService):
        self.db = db
        self.sap_api_service = sap_api_service

    def get_manager(self, payroll_number:str) -> Manager:
        manager = self.db.query(Manager).filter_by(payroll_number=payroll_number).first()
        return manager
        
    def create_partner(self, partner:PartnerData, user_mod: str) -> Partner:
        partner_data = partner.model_dump(exclude={"id"})
        partner_to_create = Partner(
            date_created=datetime.now(UTC),
            last_modified_date=datetime.now(UTC),
            last_modified_user = user_mod,
            **partner_data
        )
        self.db.add(partner_to_create)
        self.db.commit()
        return partner_to_create

    def update_partner(self, partner:PartnerData, user_mod: str) -> Partner:
        partner_to_update = self.db.query(Partner).get(partner.id)
        if not partner_to_update:
            raise PartnerDoesNotExistError(id)
        partner_to_update.id_manager = partner.id_manager
        partner_to_update.full_name = partner.full_name
        partner_to_update.payroll_number = partner.payroll_number
        partner_to_update.personnel_number = partner.personnel_number
        partner_to_update.company_code = partner.company_code
        partner_to_update.profit_center = partner.profit_center
        partner_to_update.cost_center = partner.cost_center
        partner_to_update.last_modified_user = user_mod
        partner_to_update.last_modified_date = datetime.now(UTC)
        self.db.add(partner_to_update)
        self.db.commit()
        return partner_to_update

    def get_partners(self, company_code: str) -> List[Partner]:
        partners = self.db.query(Partner).filter_by(company_code=company_code).all()
        return partners
        


