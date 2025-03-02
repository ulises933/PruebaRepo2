import pytest
from sqlalchemy.orm import Session
from app.bussiness_logic.factura_tracking_service import FacturaTrackingService
from app.bussiness_logic.corte_mensual_service import CorteMensualService
from app.bussiness_logic.comisiones_service import ComisionesService
from app.bussiness_logic.db_models import FacturaTracking, EstatusFactura, CorteComision, EstatusCorte
from app.exception import BillingCycleDoesNotExistError, BillingDocumentOutOfBillingCycleError
from unittest.mock import AsyncMock

@pytest.fixture
def db_session(mocker):
    # Mock de la sesión de la base de datos
    return mocker.Mock(spec=Session)

@pytest.fixture
def factura_tracking_service(db_session, mocker):
    return FacturaTrackingService(db_session, mocker.Mock())

@pytest.fixture
def corte_mensual_service(db_session):
    return CorteMensualService(db_session)

@pytest.fixture
def comisiones_service(mocker):
    corte_service_mock = mocker.Mock()
    factura_service_mock = mocker.Mock()
    sap_api_service_mock = mocker.Mock()
    sap_odata_service_mock = mocker.Mock()
    
    return ComisionesService(corte_service_mock, factura_service_mock, sap_api_service_mock, sap_odata_service_mock)

@pytest.fixture
def corte_abierto(comisiones_service, mocker):
    corte = CorteComision(id=1, estatus=EstatusCorte.ABIERTO)
    mocker.patch.object(comisiones_service.corte_service, 'obtener_corte_por_periodo', new_callable=AsyncMock, return_value=corte)
    return corte

@pytest.fixture
def corte_cerrado(comisiones_service, mocker):
    corte = CorteComision(id=1, estatus=EstatusCorte.CERRADO)
    mocker.patch.object(comisiones_service.corte_service, 'obtener_corte_por_periodo', new_callable=AsyncMock, return_value=corte)
    return corte

@pytest.fixture
def corte_actual(comisiones_service, mocker):
    corte = CorteComision(id=1, estatus=EstatusCorte.ABIERTO)
    mocker.patch.object(comisiones_service.corte_service, 'obtener_corte_actual', return_value=corte)
    return corte

@pytest.mark.asyncio
async def test_cerrar_corte(comisiones_service, mocker):
    comisiones_service.corte_service.obtener_corte_por_periodo = AsyncMock(return_value=CorteComision(id=1, estatus=EstatusCorte.CERRADO))
    comisiones_service.sap_api_service.get_facturas = AsyncMock(return_value={"A_BillingDocumentType": []})
    
    comisiones_service.sap_odata_service.send_invoice_to_sap = AsyncMock(return_value={"status": "success"})
    
    comisiones_service.corte_service.cerrar_corte = AsyncMock()

    result = await comisiones_service.cerrar_corte(2024, 12, "test_personnel", "test_group", "EN", "test_user")
    
    assert result["status"] == "success"

@pytest.mark.asyncio
async def test_obtener_facturas_corte_abierto(comisiones_service, corte_abierto, mocker):
    comisiones_service.sap_api_service.get_facturas = AsyncMock(return_value={
        "A_BillingDocumentType": [
            {"BillingDocumentStatus": "Completed", "InvoiceIsClearing": "false"}
        ]
    })
    comisiones_service.factura_service.procesar_factura = AsyncMock(return_value=FacturaTracking(id=1, billing_document="1000000222", importe_total=100.0))
    
    result = await comisiones_service.obtener_facturas(2024, 12, "test_personnel", "test_group", "EN")
    
    assert len(result) == 1
    assert result[0].billing_document == "1000000222"
    assert result[0].importe_total == 100.0

@pytest.mark.asyncio
async def test_obtener_facturas_corte_cerrado(comisiones_service, corte_cerrado, mocker):
    comisiones_service.factura_service.obtener_facturas_comisionables_por_id_corte = mocker.Mock(return_value=[FacturaTracking(id=1, billing_document="1000000222", importe_total=100.0)])
    
    result = await comisiones_service.obtener_facturas(2024, 12, "test_personnel", "test_group", "EN")
    
    assert len(result) == 1
    assert result[0].billing_document == "1000000222"
    assert result[0].importe_total == 100.0

@pytest.mark.asyncio
async def test_obtener_facturas_factura_no_valida(comisiones_service, corte_abierto, mocker):
    comisiones_service.sap_api_service.get_facturas = AsyncMock(return_value={
        "A_BillingDocumentType": [
            {"BillingDocumentStatus": "Pending", "InvoiceIsClearing": "false"}  # Estado no válido
        ]
    })
    
    result = await comisiones_service.obtener_facturas(2024, 12, "test_personnel", "test_group", "EN")
    
    assert len(result) == 0  # No se deben procesar facturas no válidas

@pytest.mark.asyncio
async def test_actualizar_estatus_facturas_exitoso(comisiones_service, corte_actual, mocker):
    # Mockear las facturas que pertenecen al corte actual
    facturas_modificadas = [FacturaTracking(id=1, estatus=EstatusFactura.PAGABLE, id_corte=corte_actual.id)]
    comisiones_service.factura_service.actualizar_estado_factura = mocker.Mock()
    
    comisiones_service.actualizar_estatus_facturas(facturas_modificadas, "test_user")
    
    # Verificar que se haya llamado a actualizar_estado_factura
    comisiones_service.factura_service.actualizar_estado_factura.assert_called_once_with(1, EstatusFactura.PAGABLE, "test_user")

@pytest.mark.asyncio
async def test_actualizar_estatus_facturas_corte_no_existente(comisiones_service, mocker):
    # Mockear la ausencia de corte
    comisiones_service.corte_service.obtener_corte_actual = mocker.Mock(return_value=None)
    
    with pytest.raises(BillingCycleDoesNotExistError, match="No billing cycle has been created yet."):
        comisiones_service.actualizar_estatus_facturas([], "test_user")

@pytest.mark.asyncio
async def test_actualizar_estatus_facturas_factura_no_perteneciente(comisiones_service, corte_actual, mocker):    
    ## ID de corte diferente (corte_actual.id = 1)
    facturas_modificadas = [FacturaTracking(id=1, estatus=EstatusFactura.PAGABLE, id_corte=999)]
    with pytest.raises(BillingDocumentOutOfBillingCycleError):
        comisiones_service.actualizar_estatus_facturas(facturas_modificadas, "test_user")

