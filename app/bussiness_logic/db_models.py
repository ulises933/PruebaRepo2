from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, JSON, Enum, UniqueConstraint
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

class PartnerCommissionConfiguration(Base):
    __tablename__ = 'partner_commission_configuration'

    id = Column(Integer, primary_key=True, autoincrement=True)
    personnel_number = Column(String, nullable=False, unique=True, index=True)
    full_name = Column(String, nullable=False)
    commission_percent = Column(Float, nullable=False)
    fixed_fee = Column(Float, nullable=False)
    customer_price_group = Column(String, nullable=False, index=True)
    date_created = Column(DateTime, default=datetime.utcnow)
    last_modified_date = Column(DateTime, default=datetime.utcnow)
    last_modified_user = Column(String)

    __table_args__ = (UniqueConstraint('customer_price_group', 'personnel_number', name='uq_personnel_number'),)

    def serialize(self):
        return {
            "id": self.id,
            "personnel_number": self.personnel_number,
            "full_name": self.full_name,
            "commission_percent": self.commission_percent,
            "fixed_fee": self.fixed_fee,
            "customer_price_group": self.customer_price_group,
            "date_created": self.date_created.isoformat() if self.date_created else None,
            "last_modified_date": self.last_modified_date.isoformat() if self.last_modified_date else None,
            "last_modified_user": self.last_modified_user,
        }

class ItemCommissionConfiguration(Base):
    __tablename__ = 'item_commission_configuration'

    id = Column(Integer, primary_key=True, autoincrement=True)
    group1 = Column(String, nullable=False)
    group1_description = Column(String, nullable=False)
    group2 = Column(String, nullable=True)
    group2_description = Column(String, nullable=True)
    commission_percent = Column(Float, nullable=False)
    customer_price_group = Column(String, nullable=False, index=True)
    date_created = Column(DateTime, default=datetime.utcnow)
    last_modified_date = Column(DateTime, default=datetime.utcnow)
    last_modified_user = Column(String)

    __table_args__ = (UniqueConstraint('customer_price_group', 'group1', 'group2', name='uq_group1_group2'),)

    def serialize(self):
        return {
            "id": self.id,
            "group1": self.group1,
            "group1_description": self.group1_description,
            "group2": self.group2,
            "group2_description": self.group2_description,
            "commission_percent": self.commission_percent,
            "customer_price_group": self.customer_price_group,
            "date_created": self.date_created.isoformat() if self.date_created else None,
            "last_modified_date": self.last_modified_date.isoformat() if self.last_modified_date else None,
            "last_modified_user": self.last_modified_user,
        }


