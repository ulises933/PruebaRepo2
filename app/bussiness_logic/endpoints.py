from fastapi import APIRouter, Request, Depends
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from .dependencies import get_sap_api_service, get_factura_tracking_service
from .sap_api_service import SAPApiService
from .factura_tracking_service import FacturaTrackingService
from pydantic import BaseModel
from typing import List
from app.presentation.factura_view_formatter import FacturaViewFormatter

business_logic_router = APIRouter()
templates = Jinja2Templates(directory="app/templates")

@business_logic_router.get("/", response_class=HTMLResponse)
async def home(
    request: Request,
    sap_service: SAPApiService = Depends(get_sap_api_service),
    factura_service: FacturaTrackingService = Depends(get_factura_tracking_service)
):
    # Obtener facturas de SAP
    facturas_sap = await sap_service.get_facturas()
    
    # Procesar facturas en el tracking
    tracking_data = []
    for factura in facturas_sap["A_BillingDocumentType"]:
        tracking = await factura_service.procesar_factura(factura, "usuario_test")
        tracking_data.append(tracking)
    
    # Formatear para la vista
    facturas_procesadas = await FacturaViewFormatter.format_facturas_list(
        facturas_sap, 
        tracking_data
    )
    
    return templates.TemplateResponse(
        "facturas_comisionables.html",
        {"request": request, "facturas": facturas_procesadas}
    )

class Factura(BaseModel):
    id: str
    comisionable: bool

class FacturasRequest(BaseModel):
    facturas: List[Factura]

@business_logic_router.post("/guardar_cambios")
async def guardar_cambios(
    request: FacturasRequest,
    factura_service: FacturaTrackingService = Depends(get_factura_tracking_service)
):
    for factura in request.facturas:
        factura_service.actualizar_estado_factura(
            factura.id,
            factura.comisionable,
            "usuario_test"
        )
    
    return {"mensaje": "Cambios guardados correctamente"}