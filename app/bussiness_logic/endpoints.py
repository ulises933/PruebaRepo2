from fastapi import APIRouter, Request, Depends
from app.bussiness_logic.dependencies import get_billing_doc_tracking_service, get_monthly_cut_service, get_comisiones_service
from app.bussiness_logic.factura_tracking_service import BillingDocumentTrackingService
from app.bussiness_logic.corte_mensual_service import MonthlyCutService
from pydantic import BaseModel
from typing import List
from app.bussiness_logic.db_models import BillingDocumentStatus
from app.bussiness_logic.comisiones_service import CommissionsService
from app.xm_json_response import JsonOrXmlResponse
from app.exception import BillingDocumentOutOfBillingCycleError, BillingCycleDoesNotExistError, BillingDocumentDoesNotExistError,ClosedBillingCycleError

import logging

business_logic_router = APIRouter()

class BillingDocument(BaseModel):
    id: int
    status: BillingDocumentStatus
    monthly_cut_id: int

class BillingDocumentRequest(BaseModel):
    modified_billing_docs: List[BillingDocument]
    user_mod: str

@business_logic_router.get("/billing_documents")
async def getBillingDocuments(request:Request, billing_doc_tracking_service:BillingDocumentTrackingService=Depends(get_billing_doc_tracking_service)):
    billing_documents = billing_doc_tracking_service.get_billing_documents()
    response_content = [billing_document.serialize() for billing_document in billing_documents]
    status_code = 200
    return JsonOrXmlResponse(content=response_content, request=request, status_code=status_code)


@business_logic_router.get("/monthly_cut")
async def get_monthly_cuts(request:Request, monthly_cut_service:MonthlyCutService=Depends(get_monthly_cut_service)):
    monthly_cuts = monthly_cut_service.get_monthly_cuts()
    response_content = [monthly_cut.serialize() for monthly_cut in monthly_cuts]
    status_code = 200
    return JsonOrXmlResponse(content=response_content, request=request, status_code=status_code)

@business_logic_router.post("/guardar_cambios")
async def guardar_cambios(
    request: Request,
    billing_doc_request:BillingDocumentRequest,
    commissions_service: CommissionsService = Depends(get_comisiones_service)
):
    modified_billing_docs = billing_doc_request.modified_billing_docs
    user_mod = billing_doc_request.user_mod
    try:
        commissions_service.update_billing_document_status(modified_billing_docs, user_mod)
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
    commissions_service: CommissionsService = Depends(get_comisiones_service)
):
    try :
        billing_documents = await commissions_service.getBillingDocuments(year, month, personnel_number, customer_price_group, language)
        response_content = {
            "returnData": [billing_document.serialize() for billing_document in billing_documents],
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
async def close_billing_cycle(request: Request, closingCycleData: ClosingCycleData, commissions_service: CommissionsService = Depends(get_comisiones_service)):
    try:
        sap_response = await commissions_service.close_monthly_cut(**closingCycleData.dict())
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