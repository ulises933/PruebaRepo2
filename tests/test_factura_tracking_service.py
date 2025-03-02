# test_services.py
import pytest
from sqlalchemy.orm import Session
from app.bussiness_logic.factura_tracking_service import FacturaTrackingService
from app.bussiness_logic.db_models import FacturaTracking, EstatusFactura
from app.exception import BillingDocumentDoesNotExistError
from unittest.mock import AsyncMock

@pytest.fixture
def factura_tracking_service(mocker):
    db_session_mock = mocker.Mock()  # Mock de la sesión de la base de datos
    legacy_system_service_mock = mocker.Mock()  # Mock del servicio del sistema legado
    return FacturaTrackingService(db_session_mock, legacy_system_service_mock)

@pytest.fixture
def factura_nueva():
    return {
        "BillingDocument": "123456",
        "TotalAmount": 1000,
        "to_Item": {
            "A_BillingDocumentItemType": [
                {
                    "Material": "MATERIAL_1",
                    "to_Partner": {
                        "A_BillingDocumentItemPartnerType": {
                            "Personnel": "00000008",
                            "FullName": "PU ROlES SD"
                        }
                    }
                },
                {
                    "Material": "MATERIAL_2",
                    "to_Partner": {
                        "A_BillingDocumentItemPartnerType": {
                            "Personnel": "00000008",
                            "FullName": "PU ROlES SD"
                        }
                    }
                }
            ]
        }
    }

@pytest.fixture
def factura_existente(factura_tracking_service, mocker):
    factura = FacturaTracking(billing_document="123456", importe_total=500, estatus=EstatusFactura.PAGABLE)
    mocker.patch.object(factura_tracking_service.db.query.return_value.filter_by.return_value, 'first', return_value=factura)
    mocker.patch.object(factura_tracking_service.db.query.return_value, 'get', return_value=factura)
    return factura

@pytest.fixture
def mock_consultar_articulos_comisionables(factura_tracking_service,mocker):
    return mocker.patch.object(factura_tracking_service.legacy_system_service, "consultar_articulos_comisionables",  new_callable=AsyncMock, return_value={"MATERIAL_1": {"comision": 100}, "MATERIAL_2": {"comision": 200}})

@pytest.fixture
def mock_consultar_articulos_no_comisionables(factura_tracking_service,mocker):
    return mocker.patch.object(factura_tracking_service.legacy_system_service, "consultar_articulos_comisionables",  new_callable=AsyncMock, return_value={"MATERIAL_NO_COMISIONABLE": {"comision": 0}})

@pytest.mark.asyncio
async def test_procesar_factura_nueva(factura_tracking_service, factura_nueva, mocker, mock_consultar_articulos_comisionables):
    factura_tracking_service.db.query.return_value.filter_by.return_value.first.return_value=None

    result = await factura_tracking_service.procesar_factura(factura_nueva, "test_user", 1)

    assert result.billing_document == "123456"
    assert result.importe_total == 1000
    assert result.estatus == EstatusFactura.PAGABLE
    assert result.articulos == {"MATERIAL_1": {"comision": 100}, "MATERIAL_2": {"comision": 200}}
    assert result.importe_comision == 300
    factura_tracking_service.db.add.assert_called_once()
    factura_tracking_service.db.commit.assert_called_once()

@pytest.mark.asyncio
async def test_procesar_factura_existente(factura_tracking_service, factura_nueva, factura_existente, mocker, mock_consultar_articulos_comisionables):
    result = await factura_tracking_service.procesar_factura(factura_nueva, "test_user", 1)
    assert result.importe_total == 500
    assert result.importe_comision == 300
    factura_tracking_service.db.commit.assert_called_once()

@pytest.mark.asyncio
async def test_procesar_factura_materiales_no_comisionables(factura_tracking_service, mock_consultar_articulos_no_comisionables, mocker):
    factura_sap = {
        "BillingDocument": "123456",
        "TotalAmount": 1000,
        "to_Item": {
            "A_BillingDocumentItemType": [
                {
                    "Material": "MATERIAL_NO_COMISIONABLE",
                    "to_Partner": {
                        "A_BillingDocumentItemPartnerType": {
                            "Personnel": "00000008",
                            "FullName": "PU ROlES SD"
                        }
                    }
                }
            ]
        }
    }
    
    mocker.patch.object(factura_tracking_service.db.query.return_value.filter_by.return_value, 'first', return_value=None)
    result = await factura_tracking_service.procesar_factura(factura_sap, "test_user", 1)
    assert result.importe_comision == 0 

@pytest.mark.asyncio
async def test_actualizar_estado_factura_exitoso(factura_tracking_service, mocker, factura_existente):
    result = factura_tracking_service.actualizar_estado_factura(1, EstatusFactura.NO_PAGABLE, "test_user")

    assert result.estatus == EstatusFactura.NO_PAGABLE
    assert result.usuario_marcado == "test_user"
    assert result.fecha_marcado is not None
    factura_tracking_service.db.commit.assert_called_once()

@pytest.mark.asyncio
async def test_actualizar_estado_factura_no_existente(factura_tracking_service, mocker):
    mocker.patch.object(factura_tracking_service.db.query.return_value, 'get', return_value=None)

    with pytest.raises(BillingDocumentDoesNotExistError, match="No existe una factura con id=1"):
        factura_tracking_service.actualizar_estado_factura(1, EstatusFactura.NO_PAGABLE, "test_user")
