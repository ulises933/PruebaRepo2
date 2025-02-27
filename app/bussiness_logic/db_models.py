from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, JSON, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

Base = declarative_base()

class EstatusFactura(enum.Enum):
    PAGABLE = "pagable"
    NO_PAGABLE = "no pagable"
    PENDIENTE = "pendiente"

class FacturaTracking(Base):
    __tablename__ = "factura_tracking"

    id = Column(Integer, primary_key=True, index=True)
    billing_document = Column(String, unique=True, index=True)
    personnel_number = Column(String, index=True)
    estatus = Column(Enum(EstatusFactura), default=EstatusFactura.PAGABLE)
    usuario_marcado = Column(String)
    fecha_marcado = Column(DateTime, default=datetime.utcnow)
    detalle_comision = Column(String)
    articulos = Column(JSON)
    importe_comision = Column(Float, default=0.0)
    importe_total = Column(Float)
    id_corte = Column(Integer, ForeignKey('corte_comision.id'))  # Relación con CorteComision
    
    corte = relationship("CorteComision", back_populates="facturas")  # Relación inversa

    def serialize(self):
        return {
            "id": self.id,
            "billing_document": self.billing_document,
            "personnel_number": self.personnel_number,
            "estatus": self.estatus.value,
            "usuario_marcado": self.usuario_marcado,
            "fecha_marcado": self.fecha_marcado.isoformat() if self.fecha_marcado else None,
            "detalle_comision": self.detalle_comision,
            "articulos": self.articulos,
            "importe_comision": self.importe_comision,
            "importe_total": self.importe_total,
            "id_corte": self.id_corte,
        }

class EstatusCorte(enum.Enum):
    ABIERTO = "abierto"
    CERRADO = "cerrado"

class CorteComision(Base):
    __tablename__ = "corte_comision"

    id = Column(Integer, primary_key=True, index=True)
    anio_mes = Column(String, index=True, unique=True)  # Formato YYYYMM
    estatus = Column(Enum(EstatusCorte),default=EstatusCorte.ABIERTO)
    fecha_creacion = Column(DateTime, default=datetime.utcnow)
    fecha_ultima_mod = Column(DateTime, default=datetime.utcnow)
    usuario_mod = Column(String)
    #pc_mod = Column(String)

    facturas = relationship("FacturaTracking", back_populates="corte")  # Relación inversa

    def serialize(self):
        return {
            "id": self.id,
            "anio_mes": self.anio_mes,
            "estatus": self.estatus.value,
            "fecha_creacion": self.fecha_creacion.isoformat() if self.fecha_creacion else None,
            "fecha_ultima_mod": self.fecha_ultima_mod.isoformat() if self.fecha_ultima_mod else None,
            "usuario_mod": self.usuario_mod,
        }


class AuditoriaLog(Base):
    __tablename__ = "auditoria_log"
    id = Column(Integer, primary_key=True)
    accion = Column(String)
    usuario = Column(String)
    fecha = Column(DateTime)
    detalles = Column(JSON)

