from datetime import datetime, UTC
from typing import Optional, Dict, List
from sqlalchemy.orm import Session
from app.bussiness_logic.db_models import MonthlyCut, MonthlyCutStatus
from app.exception import BillingCycleDoesNotExistError, ClosedBillingCycleError
import logging

class MonthlyCutService:
    def __init__(self, db: Session):
        self.db = db

    @staticmethod
    def get_current_period():
        return datetime.now(UTC).strftime('%Y%m')

    def get_monthly_cuts(self) -> List[MonthlyCut]:
        """Lists every monthly cut"""
        return self.db.query(MonthlyCut)\
            .order_by(MonthlyCut.year_month.desc()).all()

    def get_current_monthly_cut(self) -> Optional[MonthlyCut]:
        """Gets the most recent open monthly cut"""
        return self.db.query(MonthlyCut)\
            .filter_by(status=MonthlyCutStatus.OPEN)\
            .order_by(MonthlyCut.year_month.desc())\
            .first()

    def get_monthly_cut_by_id(self, id: int) -> Optional[MonthlyCut]:
        """Gets a monthly cut by a specific id"""
        monthly_cut = self.db.query(MonthlyCut).get(id)
        
        if not monthly_cut:
            raise BillingCycleDoesNotExistError(message=f"There is no billing cycle with the specified id ({id}).")
        return monthly_cut

    async def get_monthly_cut_by_period(self, year: int, month: int) -> MonthlyCut:
        """Gets a monthly cut by a specific period or creates a new monthly cut is there isn't one if the specified period is the current period"""
        month_str = str(month).zfill(2)
        year_month = f"{year}{month_str}"
        monthly_cut = self.db.query(MonthlyCut).filter_by(year_month=year_month).first()
        if not monthly_cut:
            current_period = self.get_current_period()
            if year_month == current_period:
                logging.info(f"Creating a new monthly cut for the {year_month} period.")
                monthly_cut = await self.create_monthly_cut(year_month, "System")  
            else:
                logging.error(f"There is no monthly cut for the specified period ({year_month}).")
                raise BillingCycleDoesNotExistError(message=f"There is no billing cycle for the specified period ({year_month}).")
        return monthly_cut

    async def create_monthly_cut(self, year_month: int, usuario: str) -> MonthlyCut:
        """Creates a new monthly cut with Open status for the specified period or returns an existing monthly cut if status is Open."""
        existing_monthly_cut = self.db.query(MonthlyCut).filter_by(year_month=year_month).first()
        #TODO: Mejor cachar error por year_month existente al intentar crear un nuevo registro
        montlhy_cut = None
        if existing_monthly_cut:
            monthly_cut = existing_monthly_cut
            if existing_monthly_cut.status == MonthlyCutStatus.CLOSED:
                raise ClosedBillingCycleError(f"A monthly cut for the period {year_month} already exist.")
        else:
            new_monthly_cut = MonthlyCut(
                year_month=year_month,
                status=MonthlyCutStatus.OPEN,
                date_created=datetime.now(UTC),
                last_modified_date=datetime.now(UTC),
                last_modified_user=usuario,
            )
            
            self.db.add(new_monthly_cut)
            self.db.commit()
            monthly_cut = new_monthly_cut
        return monthly_cut

    async def close_monthly_cut(
        self, 
        year: int,
        month: int, 
        user: str, 
        open_next: bool = False
    ) -> Dict:
        """
        Closes the specified monthly cut and optionally creates a new one.
        """
        monthly_cut = await self.get_monthly_cut_by_period(year,month)

        if monthly_cut.status == MonthlyCutStatus.CLOSED:
            raise ClosedBillingCycleError(message=f"Monthly cut for period {year}{str(month).zfill(2)} is already closed.")

        monthly_cut.status = MonthlyCutStatus.CLOSED
        monthly_cut.last_modified_date = datetime.now(UTC)
        monthly_cut.last_modified_user = user
        self.db.commit()

        next_monthly_cut = None
        if open_next == True:
            next_monthly_cut_period = self._calcular_siguiente_periodo(year, month)
            next_monthly_cut = await self.create_monthly_cut(
                next_monthly_cut_period,
                user,
            )

        return {
            "closed_monthly_cut": monthly_cut,
            "next_monthly_cut": next_monthly_cut
        }

    def _calculate_next_period(self, year: int, month: int) -> int:
        """Calculates the next period and returns it in the 'YYYYMM' format."""
        
        if month == 12:
            return f"{year + 1}{1}"
        else:
            month_str = str(month + 1).zfill(2)
            return f"{year}{month_str}"