import pytest
from sqlalchemy.orm import Session
from app.bussiness_logic.corte_mensual_service import CorteMensualService
from app.bussiness_logic.db_models import CorteComision, EstatusCorte
from app.exception import BillingCycleDoesNotExistError, ClosedBillingCycleError
from datetime import datetime
import re

@pytest.fixture
def corte_mensual_service(mocker):
    # Mock de la sesión de la base de datos
    db_session_mock = mocker.Mock()
    return CorteMensualService(db_session_mock)

@pytest.fixture
def corte_abierto(corte_mensual_service, mocker):
    corte = CorteComision(id=1, estatus=EstatusCorte.ABIERTO, anio_mes="202401")
    mocker.patch.object(corte_mensual_service.db.query.return_value.filter_by.return_value, 'first', return_value=corte)
    return corte

@pytest.fixture
def corte_cerrado(corte_mensual_service, mocker):
    corte = CorteComision(id=2, estatus=EstatusCorte.CERRADO, anio_mes="202401")
    mocker.patch.object(corte_mensual_service.db.query.return_value.filter_by.return_value, 'first', return_value=corte)
    return corte

@pytest.fixture
def corte_id_existente(corte_mensual_service, mocker):
    corte = CorteComision(id=1, estatus=EstatusCorte.ABIERTO, anio_mes="202401")
    mocker.patch.object(corte_mensual_service.db.query.return_value.filter_by.return_value, 'first', return_value=corte)
    mocker.patch.object(corte_mensual_service.db.query.return_value, 'get', return_value=corte)
    return corte

@pytest.mark.asyncio
async def test_abrir_nuevo_corte_existente(corte_mensual_service, corte_abierto):
    result = await corte_mensual_service.abrir_nuevo_corte("202401", "test_user")
    
    assert result == corte_abierto 

@pytest.mark.asyncio
async def test_abrir_nuevo_corte_cerrado(corte_mensual_service, corte_cerrado):
    with pytest.raises(ClosedBillingCycleError, match="Ya existe un corte cerrado para el período 202401"):
        await corte_mensual_service.abrir_nuevo_corte("202401", "test_user")

@pytest.mark.asyncio
async def test_abrir_nuevo_corte_creacion(corte_mensual_service, mocker):
    # Mockear la ausencia de un corte existente
    corte_mensual_service.db.query.return_value.filter_by.return_value.first.return_value = None
    
    # Mockear la creación de un nuevo corte
    nuevo_corte = CorteComision(id=2, estatus=EstatusCorte.ABIERTO, anio_mes="202401")
    corte_mensual_service.db.add = mocker.Mock()
    corte_mensual_service.db.commit = mocker.Mock()
    
    result = await corte_mensual_service.abrir_nuevo_corte("202401", "test_user")
    
    # Verificar que se haya creado un nuevo corte
    corte_mensual_service.db.add.assert_called_once()
    corte_mensual_service.db.commit.assert_called_once()
    assert result.anio_mes == "202401"
    assert result.estatus == EstatusCorte.ABIERTO

@pytest.mark.asyncio
async def test_obtener_corte_por_periodo_existente_abierto(corte_mensual_service, corte_abierto):
    result = await corte_mensual_service.obtener_corte_por_periodo(2024, 1)
    assert result == corte_abierto 

@pytest.mark.asyncio
async def test_obtener_corte_por_periodo_existente_cerrado(corte_mensual_service, corte_cerrado):
    result = await corte_mensual_service.obtener_corte_por_periodo(2024, 1)
    assert result == corte_cerrado

@pytest.mark.asyncio
async def test_obtener_corte_por_periodo_crear_nuevo_corte(corte_mensual_service, mocker):
    # Obtener el período actual
    anio_actual, mes_actual = datetime.now().year, datetime.now().month
    
    # Mockear la ausencia de un corte existente
    corte_mensual_service.db.query.return_value.filter_by.return_value.first.return_value = None
    
    # Mockear la creación de un nuevo corte
    nuevo_corte = CorteComision(id=2, estatus=EstatusCorte.ABIERTO, anio_mes=f"{anio_actual}{mes_actual:02d}")
    corte_mensual_service.db.add = mocker.Mock()
    corte_mensual_service.db.commit = mocker.Mock(return_value=None)
    
    result = await corte_mensual_service.obtener_corte_por_periodo(anio_actual, mes_actual)
    
    # Verificar que se haya creado un nuevo corte
    corte_mensual_service.db.add.assert_called_once()
    corte_mensual_service.db.commit.assert_called_once()
    assert result.anio_mes == f"{anio_actual}{mes_actual:02d}"
    assert result.estatus == EstatusCorte.ABIERTO

@pytest.mark.asyncio
async def test_obtener_corte_por_periodo_no_existente(corte_mensual_service, mocker):
    # Obtener el período actual
    anio_anterior, mes_actual = datetime.now().year - 1, datetime.now().month
    
    # Mockear la ausencia de un corte existente
    corte_mensual_service.db.query.return_value.filter_by.return_value.first.return_value = None
    
    # Mensaje de error esperado
    expected_message = f"There is no billing cycle for the specified period ({anio_anterior}{str(mes_actual).zfill(2)})."
    
    # Simular que el período no corresponde al mes actual
    with pytest.raises(BillingCycleDoesNotExistError, match=re.escape(expected_message)):
        await corte_mensual_service.obtener_corte_por_periodo(anio_anterior, mes_actual)

@pytest.mark.asyncio
async def test_obtener_corte_por_periodo_existente(corte_mensual_service, mocker):
    anio_actual, mes_actual = datetime.now().year, datetime.now().month
    
    corte = CorteComision(id=1, estatus=EstatusCorte.ABIERTO, anio_mes=f"{anio_actual}{mes_actual:02d}")
    mocker.patch.object(corte_mensual_service.db.query.return_value.filter_by.return_value, 'first', return_value=corte)
    
    result = await corte_mensual_service.obtener_corte_por_periodo(anio_actual, mes_actual)
    
    assert result == corte

@pytest.mark.asyncio
async def test_cerrar_corte_exitoso(corte_mensual_service, corte_abierto, mocker):
    corte_mensual_service.db.commit = mocker.Mock(return_value=None)

    await corte_mensual_service.cerrar_corte(2024, 1, "test_user", open_next=False)
    
    assert corte_abierto.estatus == EstatusCorte.CERRADO
    assert corte_abierto.usuario_mod == "test_user"
    corte_mensual_service.db.commit.assert_called_once()

@pytest.mark.asyncio
async def test_cerrar_corte_ya_cerrado(corte_mensual_service, corte_cerrado):    
    with pytest.raises(ClosedBillingCycleError, match="El corte del período 202401 ya está cerrado"):
        await corte_mensual_service.cerrar_corte(2024, 1, "test_user", open_next=False)

@pytest.mark.asyncio
async def test_cerrar_corte_no_existente(corte_mensual_service, mocker):
    corte_mensual_service.db.query.return_value.filter_by.return_value.first.return_value = None
    
    with pytest.raises(BillingCycleDoesNotExistError, match=re.escape("There is no billing cycle for the specified period (202401).")):
        await corte_mensual_service.cerrar_corte(2024, 1, "test_user", open_next=False)

@pytest.mark.asyncio
async def test_obtener_corte_por_id_existente(corte_mensual_service, corte_id_existente):
    result = corte_mensual_service.obtener_corte_por_id(1)
    
    assert result == corte_id_existente

@pytest.mark.asyncio
async def test_obtener_corte_por_id_no_existente(corte_mensual_service, mocker):
    corte_mensual_service.db.query.return_value.get.return_value = None
    
    with pytest.raises(BillingCycleDoesNotExistError, match=re.escape("There is no billing cycle with the specified id (999).")):
        corte_mensual_service.obtener_corte_por_id(999)  # ID que no existe