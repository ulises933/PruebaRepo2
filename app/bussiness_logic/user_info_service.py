
from typing import  Dict

import aiohttp
from app.trino import TrinoOperations
import logging
from app.env_variables import TRINO_CATALOG_TICENTRAL

class UserInfoService:
    def __init__(self):
        # Configuración para conexión a Trino/sistema legado
        self.trino = TrinoOperations(TRINO_CATALOG_TICENTRAL)  

    async def get_user_info_from_token_SSO(self, token: str) -> Dict:
        """
        Evaluates SSO token and returns user information
        Args:
            token: SSO authentication token
        Returns:
            Dictionary containing user information like email, name, roles etc.
        """
        try:
            headers = {"Authorization": f"Bearer {token}"}
            
            async with aiohttp.ClientSession() as session:
                async with session.get("https://graph.microsoft.com/v1.0/me", headers=headers) as response:
                    if response.status != 200:
                        logging.error(f"Error getting user info: {response.status}")
                        logging.info(f"Response: {await response.text()}")
                        return {}
                        
                    user_data = await response.json()
                    return {
                        field: user_data.get(ms_field, default) 
                        for field, (ms_field, default) in {
                            "email": ("mail", None),
                            "name": ("displayName", None),
                            "given_name": ("givenName", None), 
                            "surname": ("surname", None),
                            "job_title": ("jobTitle", None),
                            "office_location": ("officeLocation", None),
                            "business_phones": ("businessPhones", []),
                            "mobile_phone": ("mobilePhone", None),
                            "preferred_language": ("preferredLanguage", None),
                            "user_principal_name": ("userPrincipalName", None),
                            "id": ("id", None)
                        }.items()
                    }
                        
        except Exception as e:
            logging.error(f"Error evaluating SSO token: {str(e)}")
            return {}
            
    async def get_user_info_from_legacy_system(self, email: str) -> Dict:
        """
        Gets user information from legacy system database using Trino
        Args:
            email: User email to search
        Returns:
            Dictionary containing user information from legacy system
        """
        try:
            # Define fields to query
            fields = [ "claempleado", "nombreperfil", "nombreusuario", 
                     "apellidopaterno", "apellidomaterno", "email", "puesto"]
            
            conditions = {
                "bajalogica": 0,
                "bajanomina": 0,
                "email": email
            }

            result = self.trino.execute_simple_select(
                table="ticentral.dbo.titrausuario",
                fields=fields,
                conditions=conditions
            )

            if result:
                return result[0]

            return {}

        except Exception as e:
            logging.error(f"Error getting user info from legacy system: {str(e)}")
            return {}