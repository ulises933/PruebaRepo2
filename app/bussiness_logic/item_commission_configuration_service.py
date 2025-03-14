from typing import Dict, List, Tuple
from sqlalchemy.orm import Session
from app.bussiness_logic.db_models import ItemCommissionConfiguration
from app.exception import ItemConfigurationDoesNotExistError
from datetime import datetime, UTC
from pydantic import BaseModel
from typing import List, Optional

class ItemConfiguration(BaseModel):
    group1: str
    group1_description: str
    group2: Optional[str] = None
    group2_description: Optional[str] = None
    commission_percent: float
    customer_price_group: str

class ItemConfigurationUpdate(BaseModel):
    id: int
    commission_percent: float

class ItemCommissionConfigurationService:
    def __init__(self, db: Session):
        self.db = db
    
    def listConfigurations(self, customer_price_group: str) -> List[ItemCommissionConfiguration]:
        item_configurations = self.db.query(ItemCommissionConfiguration).filter_by(customer_price_group=customer_price_group).all()
        return item_configurations
    
    def getConfiguration(self, customer_price_group: str, group1: str, group2: str) -> List[ItemCommissionConfiguration]:
        item_configuration = self.db.query(ItemCommissionConfiguration).filter_by(group1=group1,group2=group2,customer_price_group=customer_price_group).first()
        return item_configuration

    def createConfiguration(self, ItemConfiguration: ItemConfiguration, user_mod: str) -> ItemCommissionConfiguration:
        commission_config = ItemCommissionConfiguration(
            date_created=datetime.now(UTC),
            last_modified_date=datetime.now(UTC),
            last_modified_user = user_mod,
            **ItemConfiguration.model_dump()
        )
        self.db.add(commission_config)
        self.db.commit()
        return commission_config

    def updateConfiguration(self, itemConfigurationUpdate: ItemConfigurationUpdate, user_mod: str) -> ItemCommissionConfiguration:
        item_configuration = self.db.query(ItemCommissionConfiguration).get(itemConfigurationUpdate.id)
        if not item_configuration:
            raise ItemConfigurationDoesNotExistError(id)
        else:
            item_configuration.commission_percent = itemConfigurationUpdate.commission_percent
            item_configuration.last_modified_date = datetime.now(UTC)
            item_configuration.last_modified_user = user_mod
            self.db.commit()
        return item_configuration

    def bulkUpdateConfigurations(self, itemConfigurationUpdates: List[ItemConfigurationUpdate], user_mod: str) -> List[ItemCommissionConfiguration]:
        update_data = [
            {
                'id': itemConfiguration.id,
                'commission_percent': itemConfiguration.commission_percent,
                'last_modified_date': datetime.now(UTC),
                'last_modified_user': user_mod
            }
            for itemConfiguration in itemConfigurationUpdates
        ]
        self.db.bulk_update_mappings(ItemCommissionConfiguration, update_data)
        self.db.commit()
        itemConfigurations = (
            self.db.query(ItemCommissionConfiguration)
            .filter(
                ItemCommissionConfiguration.id.in_(
                    [config.id for config in itemConfigurationUpdates]
                )
            )
        )

        return itemConfigurations 

    def get_commission_rate(self, customer_price_group: str, group1: str, group2: str) -> float:
        item_configuration = self.getConfiguration(customer_price_group, group1, group2)
        commission_rate = 0
        if item_configuration:
            commission_rate = item_configuration["commission_percent"]
        return commission_rate
