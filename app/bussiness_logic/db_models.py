from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, JSON, Enum
from sqlalchemy.orm import relationship, declarative_base
from datetime import datetime
import enum

Base = declarative_base()

class BillingDocumentStatus(enum.Enum):
    PAYABLE = "payable"
    NOT_PAYABLE = "not payable"
    PENDING = "pending"

class BillingDocumentTracking(Base):
    __tablename__ = "billing_document_tracking"

    id = Column(Integer, primary_key=True, index=True)
    billing_document = Column(String, unique=True, index=True)
    personnel_number = Column(String, index=True)
    status = Column(Enum(BillingDocumentStatus), default=BillingDocumentStatus.PAYABLE)
    last_modified_user = Column(String)
    last_modified_date = Column(DateTime, default=datetime.utcnow)
    commission_detail = Column(String)
    items = Column(JSON)
    commission_amount = Column(Float, default=0.0)
    total_amount = Column(Float)
    monthly_cut_id = Column(Integer, ForeignKey('monthly_cut.id'))  # Relación con MonthlyCut
    
    monthly_cut = relationship("MonthlyCut", back_populates="billing_documents")  # Relación inversa

    def serialize(self):
        return {
            "id": self.id,
            "billing_document": self.billing_document,
            "personnel_number": self.personnel_number,
            "status": self.status.value,
            "last_modified_user": self.last_modified_user,
            "last_modified_date": self.last_modified_date.isoformat() if self.last_modified_date else None,
            "commission_detail": self.commission_detail,
            "items": self.items,
            "commission_amount": self.commission_amount,
            "total_amount": self.total_amount,
            "monthly_cut_id": self.monthly_cut_id,
        }

class MonthlyCutStatus(enum.Enum):
    OPEN = "open"
    CLOSED = "closed"

class MonthlyCut(Base):
    __tablename__ = "monthly_cut"

    id = Column(Integer, primary_key=True, index=True)
    year_month = Column(String, index=True, unique=True)  # YYYYMM Format
    status = Column(Enum(MonthlyCutStatus),default=MonthlyCutStatus.OPEN)
    date_created = Column(DateTime, default=datetime.utcnow)
    last_modified_date = Column(DateTime, default=datetime.utcnow)
    last_modified_user = Column(String)

    billing_documents = relationship("BillingDocumentTracking", back_populates="monthly_cut")

    def serialize(self):
        return {
            "id": self.id,
            "year_month": self.year_month,
            "status": self.status.value,
            "date_created": self.date_created.isoformat() if self.date_created else None,
            "last_modified_date": self.last_modified_date.isoformat() if self.last_modified_date else None,
            "last_modified_user": self.last_modified_user,
        }


class AuditoriaLog(Base):
    __tablename__ = "auditoria_log"
    id = Column(Integer, primary_key=True)
    accion = Column(String)
    usuario = Column(String)
    fecha = Column(DateTime)
    detalles = Column(JSON)

