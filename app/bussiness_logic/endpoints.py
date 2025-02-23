from fastapi import APIRouter, Request, Depends
from app.bussiness_logic.dependencies import get_factura_tracking_service, get_corte_mensual_service, get_comisiones_service
from app.bussiness_logic.factura_tracking_service import FacturaTrackingService
from app.bussiness_logic.corte_mensual_service import CorteMensualService
from pydantic import BaseModel
from typing import List
from app.bussiness_logic.db_models import EstatusFactura
from app.bussiness_logic.comisiones_service import ComisionesService
from app.xm_json_response import JsonOrXmlResponse
from app.exception import BillingDocumentOutOfBillingCycleError, BillingCycleDoesNotExistError, BillingDocumentDoesNotExistError,ClosedBillingCycleError


business_logic_router = APIRouter()

class Factura(BaseModel):
    id: int
    estatus: EstatusFactura
    id_corte: int

class FacturasRequest(BaseModel):
    facturas: List[Factura]
    user: str

@business_logic_router.get("/facturas")
async def obtener_facturas(request:Request, factura_service:FacturaTrackingService=Depends(get_factura_tracking_service)):
    facturas = factura_service.obtener_facturas_comisionables()
    response_content = [factura.serialize() for factura in facturas]
    status_code = 200
    return JsonOrXmlResponse(content=response_content, request=request, status_code=status_code)


@business_logic_router.get("/cortes")
async def obtener_cortes(request:Request, corte_service:CorteMensualService=Depends(get_corte_mensual_service)):
    cortes = corte_service.obtener_cortes()
    response_content = [corte.serialize() for corte in cortes]
    status_code = 200
    return JsonOrXmlResponse(content=response_content, request=request, status_code=status_code)

@business_logic_router.post("/guardar_cambios")
async def guardar_cambios(
    request: Request,
    data:FacturasRequest,
    comisiones_service: ComisionesService = Depends(get_comisiones_service)
):
    try:
        await comisiones_service.actualizar_estatus_facturas(data.facturas, data.user)
        response_content = {
            "returnData": "",
            "displayMessage": "Billing documents successfully updated."
        }
        status_code = 200
    except BillingCycleDoesNotExistError as e:
        response_content = str(e)
        status_code = 409
    except BillingDocumentDoesNotExistError as e:
        response_content = str(e)
        status_code = 409
    except BillingDocumentOutOfBillingCycleError as e:
        response_content = str(e)
        status_code = 409
    except Exception as e:
        response_content = {
            "errorMessage": str(e),
            "displayMessage": "Error when attempting to update billing documents."
        }
        status_code = 500
    
    
    return JsonOrXmlResponse(content=response_content, request=request, status_code=status_code)


@business_logic_router.get("/comission_summary")
async def comission_summary(
    request:Request,
    year: int = 2024,
    month: int = 12,
    personnel_number: str = "0",
    commissions_service: ComisionesService = Depends(get_comisiones_service)
):
    try :
        facturas = await commissions_service.obtener_facturas(year, month, personnel_number)
        response_content = {
            "returnData": [factura.serialize() for factura in facturas],
            "displayMessage": "Billing documents successfully retrieved."
        }
        status_code = 200
    except Exception as e:
        response_content = {
            "errorMessage": str(e),
            "displayMessage": "Error when attempting to list billing documents."
        }
        status_code = 500
    
    return JsonOrXmlResponse(content=response_content, request=request, status_code=status_code)

class ClosingCycleData(BaseModel):
    year: int
    month: int
    user: str

@business_logic_router.post("/close_billing_cycle")
async def close_billing_cycle(request: Request, data: ClosingCycleData, commissions_service: ComisionesService = Depends(get_comisiones_service)):
    try:
        sap_response = await commissions_service.cerrar_corte(data.year, data.month, data.user)
        response_content = {
            "returnData": sap_response,
            "displayMessage": "Billing cycle closed successfully."
        }
        status_code = 200
    except BillingCycleDoesNotExistError as e:
        response_content = str(e)
        status_code = 409
    except ClosedBillingCycleError as e:
        response_content = str(e)
        status_code = 409
    except Exception as e:
        response_content = {
            "errorMessage": str(e),
            "displayMessage": "Error when attempting to close the specified billing cycle."
        }
        status_code = 500
    return JsonOrXmlResponse(content=response_content, request=request, status_code=status_code)