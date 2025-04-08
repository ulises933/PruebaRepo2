from datetime import datetime
from typing import List, Optional
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.bussiness_logic.db_models import Capturist

# Add these Pydantic models at the top of the file
class CapturistBase(BaseModel):
    full_name: str
    email: str
    payroll_number: str
    personnel_number: str
    company_code: str

class CapturistCreate(CapturistBase):
    pass

class CapturistUpdate(CapturistBase):
    id: int
    is_active: bool

class CapturistService:
    def __init__(self, db: Session):
        self.db = db

    def create_capturist(self, capturist: CapturistCreate, user_mod: str) -> Capturist:
        """
        Creates a new capturist in the database.
        """
        db_capturist = Capturist(
            full_name=capturist.full_name,
            email=capturist.email,
            payroll_number=capturist.payroll_number,
            personnel_number=capturist.personnel_number,
            company_code=capturist.company_code,
            is_active=True,
            created_by=user_mod,
            created_at=datetime.utcnow(),
            modified_by=user_mod,
            modified_at=datetime.utcnow()
        )
        
        self.db.add(db_capturist)
        self.db.commit()
        self.db.refresh(db_capturist)
        
        return db_capturist

    def update_capturist(self, capturist_id: int, capturist: CapturistUpdate, user_mod: str) -> Capturist:
        """
        Updates an existing capturist in the database.
        """
        db_capturist = self.db.query(Capturist).get(capturist_id)
        if not db_capturist:
            raise ValueError(f"Capturist with id {capturist_id} not found")

        db_capturist.full_name = capturist.full_name
        db_capturist.email = capturist.email
        db_capturist.payroll_number = capturist.payroll_number
        db_capturist.personnel_number = capturist.personnel_number
        db_capturist.company_code = capturist.company_code
        db_capturist.is_active = capturist.is_active
        db_capturist.modified_by = user_mod
        db_capturist.modified_at = datetime.utcnow()

        self.db.commit()
        self.db.refresh(db_capturist)
        
        return db_capturist

    def get_capturists(self, active_only: bool = True) -> List[Capturist]:
        """
        Retrieves all capturists, optionally filtering for active only.
        """
        query = self.db.query(Capturist)
        if active_only:
            query = query.filter(Capturist.is_active == True)
        return query.all()

    def get_capturist(self, capturist_id: int) -> Optional[Capturist]:
        """
        Retrieves a specific capturist by ID.
        """
        return self.db.query(Capturist).get(capturist_id)