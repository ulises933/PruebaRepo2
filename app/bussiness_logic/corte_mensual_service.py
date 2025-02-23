from datetime import datetime
from typing import Optional, Dict
from sqlalchemy.orm import Session
from app.bussiness_logic.db_models import CorteComision, EstatusCorte
from app.exception import BillingCycleDoesNotExistError, ClosedBillingCycleError

class CorteMensualService:
    def __init__(self, db: Session):
        self.db = db

    def obtener_cortes(self) -> Optional[CorteComision]:
        """Obtiene el corte abierto más reciente"""
        return self.db.query(CorteComision)\
            .order_by(CorteComision.anio_mes.desc())

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

    async def obtener_corte_por_periodo(self, anio: int, mes: int) -> CorteComision:
        """Obtiene un corte específico por período o crea uno nuevo si corresponde al mes actual."""
        anio_mes = anio * 100 + mes
        corte = self.db.query(CorteComision).filter_by(anio_mes=anio_mes).first()
        if corte:
            return corte

        mes_actual = datetime.utcnow().month
        anio_actual = datetime.utcnow().year

        if mes == mes_actual and anio == anio_actual:
            return await self.abrir_nuevo_corte(anio_mes, "Sistema")
        raise BillingCycleDoesNotExistError(message=f"There is no billing cycle for the specified period ({anio_mes}).")

    async def abrir_nuevo_corte(self, anio_mes: int, usuario: str) -> CorteComision:
        """Abre un nuevo corte para el período especificado"""
        corte_existente = self.db.query(CorteComision).filter_by(anio_mes=anio_mes).first()
        if corte_existente:
            if corte_existente.estatus == EstatusCorte.CERRADO:
                raise PeriodClosedError(f"Ya existe un corte cerrado para el período {anio_mes}")
            return corte_existente
        
        nuevo_corte = CorteComision(
            anio_mes=anio_mes,
            estatus=EstatusCorte.ABIERTO,
            fecha_creacion=datetime.utcnow(),
            fecha_ultima_mod=datetime.utcnow(),
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
        open_next: bool = True
    ) -> Dict:
        """
        Cierra el corte actual y opcionalmente abre el siguiente
        """
        corte = await self.obtener_corte_por_periodo(year,month)

        if corte.estatus == EstatusCorte.CERRADO:
            raise ClosedBillingCycleError(message=f"El corte del período {year}{month} ya está cerrado")

        corte.estatus = EstatusCorte.CERRADO
        corte.fecha_ultima_mod = datetime.utcnow()
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
            return (year + 1) * 100 + 1
        else:
            return year * 100 + (month + 1)