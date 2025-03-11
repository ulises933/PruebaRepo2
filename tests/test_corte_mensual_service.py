import pytest
from sqlalchemy.orm import Session
from app.bussiness_logic.corte_mensual_service import MonthlyCutService
from app.bussiness_logic.db_models import MonthlyCut, MonthlyCutStatus
from app.exception import BillingCycleDoesNotExistError, ClosedBillingCycleError
from datetime import datetime
import re

@pytest.fixture
def monthly_cut_service(mocker):
    # db session mock
    db_session_mock = mocker.Mock()
    return MonthlyCutService(db_session_mock)

@pytest.fixture
def open_monthly_cut(monthly_cut_service, mocker):
    monthly_cut = MonthlyCut(id=1, status=MonthlyCutStatus.OPEN, year_month="202401")
    mocker.patch.object(monthly_cut_service.db.query.return_value.filter_by.return_value, 'first', return_value=monthly_cut)
    return monthly_cut

@pytest.fixture
def closed_monthly_cut(monthly_cut_service, mocker):
    monthly_cut = MonthlyCut(id=2, status=MonthlyCutStatus.CLOSED, year_month="202401")
    mocker.patch.object(monthly_cut_service.db.query.return_value.filter_by.return_value, 'first', return_value=monthly_cut)
    return monthly_cut

@pytest.fixture
def existing_monthly_cut_id(monthly_cut_service, mocker):
    monthly_cut = MonthlyCut(id=1, status=MonthlyCutStatus.OPEN, year_month="202401")
    mocker.patch.object(monthly_cut_service.db.query.return_value.filter_by.return_value, 'first', return_value=monthly_cut)
    mocker.patch.object(monthly_cut_service.db.query.return_value, 'get', return_value=monthly_cut)
    return monthly_cut

@pytest.mark.asyncio
async def test_create_monthly_cut_existing_period(monthly_cut_service, open_monthly_cut):
    result = await monthly_cut_service.create_monthly_cut("202401", "test_user")
    
    assert result == open_monthly_cut 

@pytest.mark.asyncio
async def test_create_monthly_cut_existing_and_closed_period(monthly_cut_service, closed_monthly_cut):
    with pytest.raises(ClosedBillingCycleError, match="A monthly cut for the period 202401 already exist."):
        await monthly_cut_service.create_monthly_cut("202401", "test_user")

@pytest.mark.asyncio
async def test_create_monthly_cut(monthly_cut_service, mocker):
    #no monthly cut for the current period
    monthly_cut_service.db.query.return_value.filter_by.return_value.first.return_value = None
    
    new_monthly_cut = MonthlyCut(id=2, status=MonthlyCutStatus.OPEN, year_month="202401")
    monthly_cut_service.db.add = mocker.Mock()
    monthly_cut_service.db.commit = mocker.Mock()
    
    result = await monthly_cut_service.create_monthly_cut("202401", "test_user")
    
    # Verify that a new monthly cut has been created
    monthly_cut_service.db.add.assert_called_once()
    monthly_cut_service.db.commit.assert_called_once()
    assert result.year_month == "202401"
    assert result.status == MonthlyCutStatus.OPEN

@pytest.mark.asyncio
async def test_get_existing_monhtly_cut_by_period_open_status(monthly_cut_service, open_monthly_cut):
    result = await monthly_cut_service.get_monthly_cut_by_period(2024, 1)
    assert result == open_monthly_cut 

@pytest.mark.asyncio
async def test_get_existing_monhtly_cut_by_period_closed_status(monthly_cut_service, closed_monthly_cut):
    result = await monthly_cut_service.get_monthly_cut_by_period(2024, 1)
    assert result == closed_monthly_cut

@pytest.mark.asyncio
async def test_get_non_existing_monhtly_cut_current_period(monthly_cut_service, mocker):
    # Get the current period
    current_year, current_month = datetime.now().year, datetime.now().month
    
    # No monthly cut
    monthly_cut_service.db.query.return_value.filter_by.return_value.first.return_value = None
    
    new_monthly_cut = MonthlyCut(id=2, status=MonthlyCutStatus.OPEN, year_month=f"{current_year}{current_month:02d}")
    monthly_cut_service.db.add = mocker.Mock()
    monthly_cut_service.db.commit = mocker.Mock(return_value=None)
    
    result = await monthly_cut_service.get_monthly_cut_by_period(current_year, current_month)
    
    # Verify that a new monthly cut has been created
    monthly_cut_service.db.add.assert_called_once()
    monthly_cut_service.db.commit.assert_called_once()
    assert result.year_month == f"{current_year}{current_month:02d}"
    assert result.status == MonthlyCutStatus.OPEN

@pytest.mark.asyncio
async def test_get_non_existing_monhtly_cut_by_period(monthly_cut_service, mocker):
    # Get the current period
    anio_anterior, current_month = datetime.now().year - 1, datetime.now().month
    
    # No monthly cut
    monthly_cut_service.db.query.return_value.filter_by.return_value.first.return_value = None
    
    # Expected error
    expected_message = f"There is no billing cycle for the specified period ({anio_anterior}{str(current_month).zfill(2)})."
    
    # mock period mismatch
    with pytest.raises(BillingCycleDoesNotExistError, match=re.escape(expected_message)):
        await monthly_cut_service.get_monthly_cut_by_period(anio_anterior, current_month)

@pytest.mark.asyncio
async def test_get_existing_monhtly_cut_by_period(monthly_cut_service, mocker):
    current_year, current_month = datetime.now().year, datetime.now().month
    
    monthly_cut = MonthlyCut(id=1, status=MonthlyCutStatus.OPEN, year_month=f"{current_year}{current_month:02d}")
    mocker.patch.object(monthly_cut_service.db.query.return_value.filter_by.return_value, 'first', return_value=monthly_cut)
    
    result = await monthly_cut_service.get_monthly_cut_by_period(current_year, current_month)
    
    assert result == monthly_cut

@pytest.mark.asyncio
async def test_close_monthly_cut_success(monthly_cut_service, open_monthly_cut, mocker):
    monthly_cut_service.db.commit = mocker.Mock(return_value=None)

    await monthly_cut_service.close_monthly_cut(2024, 1, "test_user", open_next=False)
    
    assert open_monthly_cut.status == MonthlyCutStatus.CLOSED
    assert open_monthly_cut.last_modified_user == "test_user"
    monthly_cut_service.db.commit.assert_called_once()

@pytest.mark.asyncio
async def test_close_monthly_cut_already_closed(monthly_cut_service, closed_monthly_cut):    
    with pytest.raises(ClosedBillingCycleError, match="Monthly cut for period 202401 is already closed."):
        await monthly_cut_service.close_monthly_cut(2024, 1, "test_user", open_next=False)

@pytest.mark.asyncio
async def test_close_non_existent_monthly_cut(monthly_cut_service, mocker):
    monthly_cut_service.db.query.return_value.filter_by.return_value.first.return_value = None
    
    with pytest.raises(BillingCycleDoesNotExistError, match=re.escape("There is no billing cycle for the specified period (202401).")):
        await monthly_cut_service.close_monthly_cut(2024, 1, "test_user", open_next=False)

@pytest.mark.asyncio
async def test_get_monthly_cut_by_id_existing_id(monthly_cut_service, existing_monthly_cut_id):
    result = monthly_cut_service.get_monthly_cut_by_id(1)
    
    assert result == existing_monthly_cut_id

@pytest.mark.asyncio
async def test_get_monthly_cut_by_id_inexistent_id(monthly_cut_service, mocker):
    monthly_cut_service.db.query.return_value.get.return_value = None
    
    with pytest.raises(BillingCycleDoesNotExistError, match=re.escape("There is no billing cycle with the specified id (999).")):
        monthly_cut_service.get_monthly_cut_by_id(999)  # non-existent id