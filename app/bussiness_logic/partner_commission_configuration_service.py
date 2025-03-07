from typing import Dict, List, Tuple
from sqlalchemy.orm import Session
from app.bussiness_logic.db_models import PartnerCommissionConfiguration
from app.exception import PartnerConfigurationDoesNotExistError
from datetime import datetime, UTC
from pydantic import BaseModel
from typing import List

class PartnerConfiguration(BaseModel):
    personnel_number: str
    full_name: str
    commission_percent: float
    fixed_fee: float
    customer_price_group: str
    

class PartnerCommissionConfigurationService:
    def __init__(self, db: Session):
        self.db = db
    
    def listConfigurations(self, customer_price_group: str) -> List[PartnerCommissionConfiguration]:
        partner_configurations = self.db.query(PartnerCommissionConfiguration).filter_by(customer_price_group=customer_price_group).all()
        return partner_configurations
    
    def getConfiguration(self, personnel_number: str) -> List[PartnerCommissionConfiguration]:
        partner_configuration = self.db.query(PartnerCommissionConfiguration).filter_by(personnel_number=personnel_number).first()
        return partner_configuration

    def createConfiguration(self, partnerConfiguration: PartnerConfiguration, user_mod: str) -> PartnerCommissionConfiguration:
        commission_config = PartnerCommissionConfiguration(
            date_created=datetime.now(UTC),
            last_modified_date=datetime.now(UTC),
            last_modified_user = user_mod,
            **partnerConfiguration.model_dump()
        )
        self.db.add(commission_config)
        self.db.commit() 
        return commission_config

    def updateConfiguration(self, partnerConfiguration: PartnerConfiguration, user_mod: str) -> PartnerCommissionConfiguration:
        personnel_number = partnerConfiguration.personnel_number
        partner_configuration = self.db.query(PartnerCommissionConfiguration).filter_by(personnel_number=personnel_number).first()

        if not partner_configuration:
            raise PartnerConfigurationDoesNotExistError(personnel_number)
        else:
            partner_configuration.fixed_fee = partnerConfiguration.fixed_fee
            partner_configuration.commission_percent = partnerConfiguration.commission_percent
            partner_configuration.last_modified_date = datetime.now(UTC)
            partner_configuration.last_modified_user = user_mod
        
        self.db.commit()
        return partner_configuration