import logging
from typing import List, Optional

from fastapi import APIRouter, Request, Depends
from pydantic import BaseModel

from app.bussiness_logic.comisiones_service import CommissionsService
from app.bussiness_logic.corte_mensual_service import MonthlyCutService
from app.bussiness_logic.db_models import BillingDocumentStatus
from app.bussiness_logic.dependencies import get_billing_doc_tracking_service, get_monthly_cut_service, \
    get_comisiones_service, get_partner_catalog_service, get_item_catalog_service,  \
    get_partner_commission_configuration_service, get_item_commission_configuration_service
from app.bussiness_logic.dependencies import get_user_info_service
from app.bussiness_logic.factura_tracking_service import BillingDocumentTrackingService
from app.bussiness_logic.partner_catalog_service import PartnerCatalogService
from app.bussiness_logic.partner_commission_configuration_service import PartnerCommissionConfigurationService, \
    PartnerConfiguration, PartnerConfigurationUpdate
from app.bussiness_logic.item_catalog_service import ItemCatalogService
from app.bussiness_logic.item_commission_configuration_service import ItemCommissionConfigurationService, \
    ItemConfiguration, ItemConfigurationUpdate
from app.bussiness_logic.user_info_service import UserInfoService
from app.exception import BillingDocumentOutOfBillingCycleError, BillingCycleDoesNotExistError, \
    BillingDocumentDoesNotExistError, ClosedBillingCycleError
from app.xm_json_response import JsonOrXmlResponse

business_logic_router = APIRouter()

def serialize_list(items):
    """
    Helper function to serialize a list of objects.
    
    Args:
        items: List of objects with a serialize method
        
    Returns:
        List of serialized objects
    """
    return [item.serialize() for item in items]

class BillingDocument(BaseModel):
    id: int
    status: BillingDocumentStatus
    penalty_amount: float
    monthly_cut_id: int

class BillingDocumentRequest(BaseModel):
    modified_billing_docs: List[BillingDocument]
    user_mod: str

@business_logic_router.get("/billing_documents")
async def get_billing_documents(request:Request, billing_doc_tracking_service:BillingDocumentTrackingService=Depends(get_billing_doc_tracking_service)):
    billing_documents = billing_doc_tracking_service.get_billing_documents()
    response_content = serialize_list(billing_documents)
    status_code = 200
    return JsonOrXmlResponse(content=response_content, request=request, status_code=status_code)


@business_logic_router.get("/monthly_cut")
async def get_monthly_cuts(request:Request, monthly_cut_service:MonthlyCutService=Depends(get_monthly_cut_service)):
    monthly_cuts = monthly_cut_service.get_monthly_cuts()
    response_content = serialize_list(monthly_cuts)
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
    year: int = 2025,
    month: int = 3,
    personnel_number: str = "0",
    customer_price_group: str = "08",
    language: str ="EN",
    commissions_service: CommissionsService = Depends(get_comisiones_service)
):
    try :
        billing_documents = await commissions_service.get_billing_documents(year, month, personnel_number, customer_price_group, language)
        response_content = {
            "returnData": serialize_list(billing_documents),
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


@business_logic_router.get("/commissions_by_partner")
async def commissions_by_partner(
    request:Request,
    year: int = 2025,
    month: int = 3,
    customer_price_group: str = "08",
    commissions_service: CommissionsService = Depends(get_comisiones_service)
):
    try :
        totals = await commissions_service.get_commissions_by_partner(year, month, customer_price_group)
        response_content = {
            "returnData": totals,
            "displayMessage": "Commission totals successfully retrieved."
        }
        status_code = 200
    except Exception as e:
        response_content = {
            "errorMessage": str(e),
            "displayMessage": "Error when attempting to list commission totals."
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
        sap_response = await commissions_service.close_monthly_cut(**closingCycleData.model_dump())
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
        logging.exception(e)
        response_content = {
            "errorMessage": str(e),
            "displayMessage": "Error validating SSO token"
        }
        status_code = 500

    return JsonOrXmlResponse(content=response_content, request=request, status_code=status_code)


@business_logic_router.get("/partners")
async def get_partners(request: Request, customer_price_group: Optional[str] = None, partner_catalog_service: PartnerCatalogService = Depends(get_partner_catalog_service)):
    """
    Lists all the partners for a specific customer price group.

    Parameters:
        customer_price_group (Optional[str]): The identifier for the customer price group to filter the partners. If omitted, partners from every customer price group will be returned

    Returns:
        List[Dict[str,str]]: A list of objects containing the full name and personnel number of each partner in the specified customer price group.

    Usage:
        This function is used to retrieve partner data from the selected customer price group to be presented as selectable options within a dropdown in the frontend.
    """
    try:
        partners = await partner_catalog_service.get_partners(customer_price_group)
        response_content = partners
        status_code = 200
    except Exception as e:
        logging.exception(e)
        response_content = {
            "errorMessage": str(e),
            "displayMessage": "Error when attempting to retrieve partners catalog."
        }
        status_code = 500
    return JsonOrXmlResponse(content= response_content, request=request, status_code=status_code)

@business_logic_router.post("/partner_configuration")
async def create_partner_configuration(request:Request, partner_configuration: PartnerConfiguration, user_mod: str, partner_commission_configuration_service:PartnerCommissionConfigurationService=Depends(get_partner_commission_configuration_service)):
    """
    Creates a new commission configuration for a specific partner.

    Parameters:
        partner_configuration (PartnerConfiguration): An object containing the details for the new partner configuration, including:
            - personnel_number (str): The SAP identifier for the partner.
            - full_name (str): The full name of the partner, for displaying purposes.
            - commission_percent (float): The commission percentage to set.
            - fixed_fee (str): The fixed fee to set.
            - customer_price_group (str): The identifier for the customer price group.
        user_mod (str): The identifier of the user making the creation.

    Returns:
        PartnerCommissionConfiguration: The newly created partner commission configuration object.

    Usage:
        This function is used to create a new partner commission configuration based on the selected personnel number and customer price group.
    """
    
    try:
        partner_configuration = partner_commission_configuration_service.create_configuration(partner_configuration, user_mod)
        response_content = partner_configuration.serialize()
        status_code = 200
    except Exception as e:
        logging.exception(e)
        response_content = {
            "errorMessage": str(e),
            "displayMessage": "Error when attempting to create a partner configuration."
        }
        status_code = 500
    return JsonOrXmlResponse(content=response_content, request=request, status_code=status_code)

@business_logic_router.patch("/partner_configurations")
async def update_partner_configurations(request:Request, partner_configurations: List[PartnerConfigurationUpdate], user_mod: str, partner_commission_configuration_service:PartnerCommissionConfigurationService=Depends(get_partner_commission_configuration_service)):
    """
    Updates existing configurations based on the provided configuration IDs. Only editable fields are updated (commission percent & fixed fee).

    Parameters:
        partner_configuration_updates (List[PartnerConfigurationUpdate]): A list of objects containing the updated values for each configuration, including:
            - id (int): The ID of the configuration to be updated.
            - commission_percent (float): The new commission percentage to set.
            - fixed_fee (float): The new fixed fee to set.
        user_mod (str): The identifier of the user making the modifications.

    Returns:
        List[PartnerCommissionConfiguration]: A list of the updated configuration objects after the changes have been applied.

    Usage:
        This function is used to modify existing partner commission configurations in bulk, allowing for updates to commission rates and fees of multiple records at once.
    """
    try:
        updated_configurations = partner_commission_configuration_service.bulk_update_configurations(partner_configurations, user_mod)
        response_content = serialize_list(updated_configurations)
        status_code = 200
    except Exception as e:
        logging.exception(e)
        response_content = {
            "errorMessage": str(e),
            "displayMessage": "Error when attempting to update a partner configuration."
        }
        status_code = 500
    return JsonOrXmlResponse(content=response_content, request=request, status_code=status_code)

@business_logic_router.get("/partner_configurations")
async def get_partner_configurations(request: Request, customer_price_group: str, partner_commission_configuration_service:PartnerCommissionConfigurationService=Depends(get_partner_commission_configuration_service)):
    """
    Returns a list of partner configurations for a specific customer price group.

    Parameters:
        customer_price_group (str): The identifier for the customer price group to filter the commission configurations.

    Returns:
        List[PartnerCommissionConfiguration]: A list of commission configurations that match the specified customer price group.

    Usage:
        This function is used to retrieve commission configurations based on the specified customer price group to be presented as a table in the frontend.
    """
    try:
        partner_configurations = partner_commission_configuration_service.list_configurations(customer_price_group)
        response_content = serialize_list(partner_configurations)
        status_code = 200
    except Exception as e:
        logging.exception(e)
        response_content = {
            "errorMessage": str(e),
            "displayMessage": "Error when attempting to retrieve partner configurations"
        }
        status_code = 500
    return JsonOrXmlResponse(content= response_content, request=request, status_code=status_code)


@business_logic_router.get("/item_groups")
async def get_item_groups(request: Request, level:int, parent_code: Optional[str]=None, customer_price_group: Optional[str] = None, item_catalog_service: ItemCatalogService = Depends(get_item_catalog_service)):
    """
    Lists all the item groups of the specified level in the product hierarchy for a specific customer price group.

    Parameters:
        level (int): The level of the item groups to retrieve (1 or 2).
        parent_code (Optional[str]): If level is 2, only groups of level 2 asociated with the specified parent group of level 1 will be returned. If omitted, all groups of level 2 will be returned.
        customer_price_group (Optional[str]): The identifier for the customer price group to filter the item groups (default is None).

    Returns:
        List[Dict[str,str]]: A list of objects containing the code and description of item groups at the specified level that match the customer price group.

    Usage:
        This function is used to retrieve item groups based on their hierarchy level and customer price group to be presented as selectable options within a dropdown in the frontend.
    """
    #level_selector = {
    #    1: item_catalog_service.get_item_groups_1,
    #    2: item_catalog_service.get_item_groups_2,
    #}
    #try:
    #    if level not in level_selector:
    #        response_content = {
    #            "errorMessage": "Bad request",
    #            "displayMessage": f"level should be one of the following: {list(level_selector.keys())}"
    #        }
    #        status_code = 403
    #    else:
    #        response_content = await level_selector[level](customer_price_group)
    #        status_code = 200
    try:
        item_groups = item_catalog_service.get_item_groups(level, parent_code)
        serialized_items = serialize_list(item_groups)
        response_content = serialized_items
        status_code = 200
    except Exception as e:
        response_content = {
            "errorMessage": str(e),
            "displayMessage": "Error when attempting to retrieve group 1 items catalog."
        }
        status_code = 500
    return JsonOrXmlResponse(content= response_content, request=request, status_code=status_code)

@business_logic_router.post("/item_configuration")
async def create_item_configuration(request:Request, item_configuration: ItemConfiguration, user_mod: str, item_commission_configuration_service:ItemCommissionConfigurationService=Depends(get_item_commission_configuration_service)):
    """
    Creates a new commission configuration for a specific combination of item groups and a specific customer price group.

    Parameters:
        item_configuration (ItemConfiguration): An object containing the details for the new item configuration, including:
            - group1 (str): The identifier for the item group of level 1 in the hierarchy.
            - group1_description (str): The description of the level 1 group, for displaying purposes.
            - group2 (str): The identifier for the item group of level 2 in the hierarchy.
            - group2_description (str): The description of the level 2 group, for displaying purposes.
            - customer_price_group (str): The identifier for the customer price group.
            - commission_percent (float): The commission percentage to set.
        user_mod (str): The identifier of the user making the creation.

    Returns:
        ItemCommissionConfiguration: The newly created item commission configuration object.

    Usage:
        This function is used to create a new item commission configuration based on the selected item groups and customer price group.
    """
    try:
        item_configuration = item_commission_configuration_service.create_configuration(item_configuration, user_mod)
        response_content = item_configuration.serialize()
        status_code = 200
    except Exception as e:
        response_content = {
            "errorMessage": str(e),
            "displayMessage": "Error when attempting to create an item configuration."
        }
        status_code = 500
    return JsonOrXmlResponse(content=response_content, request=request, status_code=status_code)

@business_logic_router.patch("/item_configurations")
async def update_item_configurations(request:Request, item_configurations: List[ItemConfigurationUpdate], user_mod: str, item_commission_configuration_service:ItemCommissionConfigurationService=Depends(get_item_commission_configuration_service)):
    """
    Updates existing configurations based on the provided configuration IDs. Only editable fields are updated (commission percent).

    Parameters:
        item_configurations (List[ItemConfigurationUpdate]): A list of objects containing the updated values for each configuration, including:
            - id (int): The ID of the configuration to be updated.
            - commission_percent (float): The new commission percentage to set.
        user_mod (str): The identifier of the user making the modifications.

    Returns:
        List[ItemCommissionConfiguration]: A list of the updated configuration objects after the changes have been applied.

    Usage:
        This function is used to modify existing item commission configurations in bulk, allowing for updates to commission rates of multiple records at once.
    """
    try:
        updated_configurations = item_commission_configuration_service.bulk_update_configurations(item_configurations, user_mod)
        response_content = serialize_list(updated_configurations)
        status_code = 200
    except Exception as e:
        response_content = {
            "errorMessage": str(e),
            "displayMessage": "Error when attempting to update an item configuration."
        }
        status_code = 500
    return JsonOrXmlResponse(content=response_content, request=request, status_code=status_code)

@business_logic_router.get("/item_configurations")
async def get_item_configurations(request: Request, customer_price_group: str, item_commission_configuration_service:ItemCommissionConfigurationService=Depends(get_item_commission_configuration_service)):
    """
    Returns a list of commission configurations by item group combination for a specific customer price group.

    Parameters:
        customer_price_group (str): The identifier for the customer price group to filter the commission configurations.

    Returns:
        List[ItemCommissionConfiguration]: A list of commission configurations that match the specified customer price group.

    Usage:
        This function is used to retrieve commission configurations based on the specified customer price group,
        allowing for tailored commission management based on customer classifications.
    """
    try:
        item_configurations = item_commission_configuration_service.list_configurations(customer_price_group)
        response_content = serialize_list(item_configurations)
        status_code = 200
    except Exception as e: 
        response_content = {
            "errorMessage": str(e),
            "displayMessage": "Error when attempting to retrieve item configurations"
        }
        status_code = 500
    return JsonOrXmlResponse(content= response_content, request=request, status_code=status_code)

@business_logic_router.get("/items")
async def get_items(request: Request, group1:str, group2:Optional[str]=None,item_catalog_service:ItemCatalogService=Depends(get_item_catalog_service)):
    """
    Returns a list of items available in the specified groups.

    Parameters:
        group1 (str): The identifier for the first item group.
        group2 (Optional[str]): The identifier for the second item group (default is None).

    Returns:
        List[Item]: A list of items available in the specified groups.

    Usage:
        This function is used for information purposes to retrieve items based on their group classifications.
    """
    try:
        items = await item_catalog_service.get_items_in_group(group1, group2)
        response_content = items
        status_code = 200
    except Exception as e: 
        response_content = {
            "errorMessage": str(e),
            "displayMessage": "Error when attempting to retrieve items"
        }
        status_code = 500
    return JsonOrXmlResponse(content= response_content, request=request, status_code=status_code)
