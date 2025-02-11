from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class FacturaTracking(Base):
    __tablename__ = 'facturas_tracking'

    id = Column(Integer, primary_key=True)
    billing_document = Column(String(50), unique=True)
    fecha_marcado = Column(DateTime, default=datetime.utcnow)
    comisionable = Column(Boolean, default=False)
    procesada = Column(Boolean, default=False)
    corte_mensual_id = Column(Integer, ForeignKey('cortes_mensuales.id'), nullable=True)
    usuario_marcado = Column(String(50))
    detalle_comision = Column(String(500))  # Para guardar detalles sobre la decisión


class CorteMensual(Base):
    __tablename__ = 'cortes_mensuales'

    id = Column(Integer, primary_key=True)
    periodo = Column(String(7))  # YYYY-MM
    fecha_generacion = Column(DateTime, default=datetime.utcnow)
    estado = Column(String(20))  # 'GENERADO', 'ENVIADO_SAP', 'PAGADO'

class ArticuloComisionable(Base):
    __tablename__ = 'articulos_comisionables'
    #__table_args__ = {'schema': 'comisiones'}
    id = Column(Integer, primary_key=True)
    codigo_articulo = Column(String(50), unique=True)
    comisionable = Column(Boolean, default=False)
    ultima_actualizacion = Column(DateTime, default=datetime.utcnow)

