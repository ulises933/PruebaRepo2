from fastapi import APIRouter, Request, Depends
from app.bussiness_logic.dependencies import get_factura_tracking_service, get_corte_mensual_service, get_comisiones_service, get_legacy_system_service, get_user_info_service
from app.bussiness_logic.factura_tracking_service import FacturaTrackingService
from app.bussiness_logic.corte_mensual_service import CorteMensualService
from pydantic import BaseModel
from typing import List
from app.bussiness_logic.db_models import EstatusFactura
from app.bussiness_logic.comisiones_service import ComisionesService
from app.bussiness_logic.legacy_system_service import LegacySystemService
from app.bussiness_logic.user_info_service import UserInfoService
from app.xm_json_response import JsonOrXmlResponse
from app.exception import BillingDocumentOutOfBillingCycleError, BillingCycleDoesNotExistError, BillingDocumentDoesNotExistError,ClosedBillingCycleError


business_logic_router = APIRouter()

class Factura(BaseModel):
    id: int
    estatus: EstatusFactura
    id_corte: int

class FacturasRequest(BaseModel):
    facturas_modificadas: List[Factura]
    usuario_modificador: str

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
    facturas_request:FacturasRequest,
    comisiones_service: ComisionesService = Depends(get_comisiones_service)
):
    facturas_modificadas = facturas_request.facturas_modificadas
    usuario_modificador = facturas_request.usuario_modificador
    try:
        await comisiones_service.actualizar_estatus_facturas(facturas_modificadas, usuario_modificador)
        response_content = {
            "returnData": "",
            "displayMessage": "Billing documents successfully updated."
        }
        status_code = 200
    except (BillingCycleDoesNotExistError, BillingDocumentDoesNotExistError, BillingDocumentOutOfBillingCycleError) as e:
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
    customer_price_group: str = "",
    language: str ="EN",
    commissions_service: ComisionesService = Depends(get_comisiones_service)
):
    try :
        facturas = await commissions_service.obtener_facturas(year, month, personnel_number, customer_price_group, language)
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
    personnel_number: str = "0"
    customer_price_group: str = ""
    language: str = "EN"

@business_logic_router.post("/close_billing_cycle")
async def close_billing_cycle(request: Request, closingCycleData: ClosingCycleData, commissions_service: ComisionesService = Depends(get_comisiones_service)):
    try:
        sap_response = await commissions_service.cerrar_corte(**closingCycleData.dict())
        response_content = {
            "returnData": sap_response,
            "displayMessage": "Billing cycle closed successfully."
        }
        status_code = 200
    except (BillingCycleDoesNotExistError, ClosedBillingCycleError) as e:
        response_content = str(e)
        status_code = 409
    except Exception as e:
        response_content = {
            "errorMessage": str(e),
            "displayMessage": "Error when attempting to close the specified billing cycle."
        }
        status_code = 500
    return JsonOrXmlResponse(content=response_content, request=request, status_code=status_code)

class SSO_token(BaseModel):
    token: str

@business_logic_router.post("/validate_sso_token")
async def validate_sso_token(
    request: Request,
    sso_token: SSO_token,
    user_info_service: UserInfoService = Depends(get_user_info_service)
):
    try:
        user_info = await user_info_service.get_user_info_from_token_SSO(sso_token.token)
        if not user_info:
            response_content = {
                "errorMessage": "Invalid or expired token", 
                "displayMessage": "Could not validate SSO token"
            }
            status_code = 401
        else:
            # Get legacy user info using email from SSO
            legacy_user_info = await user_info_service.get_user_info_from_legacy_system(user_info.get("email"))
            
            # Combine SSO and legacy user info
            user_info.update({
                "legacy_info": legacy_user_info
            })
            
            response_content = {
                "returnData": user_info,
                "displayMessage": "Token validated successfully"
            }
            status_code = 200
            
    except Exception as e:
        response_content = {
            "errorMessage": str(e),
            "displayMessage": "Error validating SSO token"
        }
        status_code = 500

    return JsonOrXmlResponse(content=response_content, request=request, status_code=status_code)

