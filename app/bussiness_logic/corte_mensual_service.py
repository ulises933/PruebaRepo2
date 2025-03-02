from datetime import datetime, UTC
from typing import Optional, Dict, List
from sqlalchemy.orm import Session
from app.bussiness_logic.db_models import CorteComision, EstatusCorte
from app.exception import BillingCycleDoesNotExistError, ClosedBillingCycleError
import logging

class CorteMensualService:
    def __init__(self, db: Session):
        self.db = db

    @staticmethod
    def obtener_periodo_en_curso():
        return datetime.now(UTC).strftime('%Y%m')

    def obtener_cortes(self) -> List[CorteComision]:
        """Enlista todos los cortes"""
        return self.db.query(CorteComision)\
            .order_by(CorteComision.anio_mes.desc()).all()

    def obtener_corte_actual(self) -> Optional[CorteComision]:
        """Obtiene el corte abierto más reciente"""
        return self.db.query(CorteComision)\
            .filter_by(estatus=EstatusCorte.ABIERTO)\
            .order_by(CorteComision.anio_mes.desc())\
            .first()

    def obtener_corte_por_id(self, id: int) -> Optional[CorteComision]:
        """Obtiene un corte por el id especificado"""
        corte = self.db.query(CorteComision).get(id)
        
        if not corte:
            raise BillingCycleDoesNotExistError(message=f"There is no billing cycle with the specified id ({id}).")
        return corte

    async def obtener_corte_por_periodo(self, anio: int, mes: int) -> CorteComision:
        """Obtiene un corte específico por período o crea uno nuevo si corresponde al mes actual."""
        mes_str = str(mes).zfill(2)
        anio_mes = f"{anio}{mes_str}"
        corte = self.db.query(CorteComision).filter_by(anio_mes=anio_mes).first()
        if not corte:
            periodo_actual = self.obtener_periodo_en_curso()
            if anio_mes == periodo_actual:
                logging.info(f"Creando nuevo registro para corte del periodo {anio_mes}")
                corte = await self.abrir_nuevo_corte(anio_mes, "Sistema")  
            else:
                logging.error(f"El periodo de corte especificado ({anio_mes}) no corresponde con un corte existente")
                raise BillingCycleDoesNotExistError(message=f"There is no billing cycle for the specified period ({anio_mes}).")
        return corte

    async def abrir_nuevo_corte(self, anio_mes: int, usuario: str) -> CorteComision:
        """Abre un nuevo corte para el período especificado"""
        corte_existente = self.db.query(CorteComision).filter_by(anio_mes=anio_mes).first()
        #TODO: Mejor cachar error por anio_mes existente al intentar crear un nuevo registro
        if corte_existente:
            if corte_existente.estatus == EstatusCorte.CERRADO:
                raise ClosedBillingCycleError(f"Ya existe un corte cerrado para el período {anio_mes}")
            return corte_existente
        
        nuevo_corte = CorteComision(
            anio_mes=anio_mes,
            estatus=EstatusCorte.ABIERTO,
            fecha_creacion=datetime.now(UTC),
            fecha_ultima_mod=datetime.now(UTC),
            usuario_mod=usuario,
        )
        
        self.db.add(nuevo_corte)
        self.db.commit()
        return nuevo_corte

    async def cerrar_corte(
        self, 
        year: int,
        month: int, 
        user: str, 
        open_next: bool = False
    ) -> Dict:
        """
        Cierra el corte actual y opcionalmente abre el siguiente
        """
        corte = await self.obtener_corte_por_periodo(year,month)

        if corte.estatus == EstatusCorte.CERRADO:
            raise ClosedBillingCycleError(message=f"El corte del período {year}{str(month).zfill(2)} ya está cerrado")

        corte.estatus = EstatusCorte.CERRADO
        corte.fecha_ultima_mod = datetime.now(UTC)
        corte.usuario_mod = user
        self.db.commit()

        siguiente_corte = None
        if open_next == True:
            siguiente_anio_mes = self._calcular_siguiente_periodo(year, month)
            siguiente_corte = await self.abrir_nuevo_corte(
                siguiente_anio_mes,
                user,
            )

        return {
            "corte_cerrado": corte,
            "siguiente_corte": siguiente_corte
        }

    def _calcular_siguiente_periodo(self, year: int, month: int) -> int:
        """Calcula el siguiente período en formato YYYYMM"""
        
        if month == 12:
            return f"{year + 1}{1}"
        else:
            month_str = str(month + 1).zfill(2)
            return f"{year}{month_str}"