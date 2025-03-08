from typing import Dict, TypeVar, Callable

T = TypeVar('T')


def get_partner_info(billing_document: Dict, extractor: Callable[[Dict], T]) -> T:
    """
    Generic function to extract partner information from a billing document structure
    
    Args:
        billing_document: The billing document dictionary
        extractor: A function that extracts the desired information from the partner structure
    """
    item_type = billing_document["to_Item"]["A_BillingDocumentItemType"]
    item_type = item_type if isinstance(item_type, dict) else item_type[0]
    partner = item_type["to_Partner"]["A_BillingDocumentItemPartnerType"]
    return extractor(partner) 