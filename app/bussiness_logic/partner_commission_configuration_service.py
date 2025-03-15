from typing import Dict, List, Tuple
from sqlalchemy.orm import Session
from app.bussiness_logic.db_models import PartnerCommissionConfiguration
from app.exception import PartnerConfigurationDoesNotExistError
from datetime import datetime, UTC
from pydantic import BaseModel
from typing import List
from sqlalchemy import update

class PartnerConfiguration(BaseModel):
    personnel_number: str
    full_name: str
    commission_percent: float
    fixed_fee: float
    customer_price_group: str
    
class PartnerConfigurationUpdate(BaseModel):
    id: int
    commission_percent: float
    fixed_fee: float

class PartnerCommissionConfigurationService:
    def __init__(self, db: Session):
        self.db = db
    
    def list_configurations(self, customer_price_group: str) -> List[PartnerCommissionConfiguration]:
        partner_configurations = self.db.query(PartnerCommissionConfiguration).filter_by(customer_price_group=customer_price_group).all()
        return partner_configurations
    
    def get_configuration(self, personnel_number: str) -> List[PartnerCommissionConfiguration]:
        partner_configuration = self.db.query(PartnerCommissionConfiguration).filter_by(personnel_number=personnel_number).first()
        return partner_configuration

    def create_configuration(self, partnerConfiguration: PartnerConfiguration, user_mod: str) -> PartnerCommissionConfiguration:
        commission_config = PartnerCommissionConfiguration(
            date_created=datetime.now(UTC),
            last_modified_date=datetime.now(UTC),
            last_modified_user = user_mod,
            **partnerConfiguration.model_dump()
        )
        self.db.add(commission_config)
        self.db.commit() 
        return commission_config

    def update_configuration(self, partnerConfigurationUpdate: PartnerConfigurationUpdate, user_mod: str) -> PartnerCommissionConfiguration:
        partner_configuration = self.db.query(PartnerCommissionConfiguration).get(partnerConfigurationUpdate.id)

        if not partner_configuration:
            raise PartnerConfigurationDoesNotExistError(partnerConfigurationUpdate.id)
        else:
            partner_configuration.fixed_fee = partnerConfigurationUpdate.fixed_fee
            partner_configuration.commission_percent = partnerConfigurationUpdate.commission_percent
            partner_configuration.last_modified_date = datetime.now(UTC)
            partner_configuration.last_modified_user = user_mod
        
        self.db.commit()
        return partner_configuration

    def get_commission_rate(self, personnel_number: str) -> float:
        partner_configuration = self.get_configuration(personnel_number)
        commission_rate = 1
        if partner_configuration:
            commission_rate = partner_configuration["commission_percent"]
        return commission_rate

    def get_fixed_fee(self, personnel_number: str) -> float:
        partner_configuration = self.get_configuration(personnel_number)
        fixed_fee = 0
        if partner_configuration:
            fixed_fee = partner_configuration["fixed_fee"]
        return fixed_fee

    def bulk_update_configurations(self, partnerConfigurationUpdates: List[PartnerConfigurationUpdate], user_mod: str) -> List[PartnerCommissionConfiguration]:
        update_data = [
            {
                'id': partnerConfiguration.id,
                'commission_percent': partnerConfiguration.commission_percent,
                'fixed_fee': partnerConfiguration.fixed_fee,
                'last_modified_date': datetime.now(UTC),
                'last_modified_user': user_mod
            }
            for partnerConfiguration in partnerConfigurationUpdates
        ]

        self.db.bulk_update_mappings(PartnerCommissionConfiguration, update_data)
        self.db.commit()

        partnerConfigurations = (
            self.db.query(PartnerCommissionConfiguration)
            .filter(
                PartnerCommissionConfiguration.id.in_(
                    [config.id for config in partnerConfigurationUpdates]
                )
            )
        )

        return partnerConfigurations