import asyncio
from typing import List, Dict
from app.trino import SQLOperations
from app.env_variables import TRINO_CATALOG

class LegacySystemService:

    # Mock del sistema legado
    MOCK_ARTICULOS_LEGADO = {
        "TG12": True,
        "TG13": False,
        "TG14": True,
        "TG15": False,
        "TG16": True,
    }

    def __init__(self):
        # Configuración para conexión a Trino/sistema legado
        self.trino = SQLOperations(TRINO_CATALOG)
    
    async def consultar_articulos_sin_comision(self) -> List[int]:
        """
        Consulta los artículos que no generan comisión según los criterios configurados desde la base de datos del sistema legado.
        """
        query = """
        WITH criterios AS (
            SELECT ClaCriterio, ValorCriterio
            FROM VtaSCh.VtaCfgArticuloSinComisionCEDI 
            WHERE BajaLogica = 0
        ),
        articulos_sin_comision AS (
            SELECT DISTINCT a.ClaArticulo
            FROM criterios c
            CROSS JOIN LATERAL (
                SELECT ClaArticulo 
                FROM VtaSch.VtaObtGpoEstadisticoArtFn(
                    CASE 
                        WHEN c.ClaCriterio = 1 THEN 5
                        WHEN c.ClaCriterio = 2 THEN 4
                        WHEN c.ClaCriterio = 3 THEN 3
                        WHEN c.ClaCriterio = 4 THEN 2
                    END,
                    c.ValorCriterio
                )
            ) a
        )
        SELECT ClaArticulo FROM articulos_sin_comision
        """
        
        try:
            """
            results = self.trino.execute_query_no_orm(query)
            return [row['ClaArticulo'] for row in results]
            """
            # return [key for key, value in MOCK_ARTICULOS_LEGADO.items() if value == False]
            return {
                "TG12": {
                    "importe": 67.34,
                    "comision": 34.67
                },
                "TG13": {
                    "importe": 54.63,
                    "comision": 22.67
                },
                "TG14": {
                    "importe": 23.88,
                    "comision": 12.3
                },
                "TG15": {
                    "importe": 78.25,
                    "comision": 43.2
                },
                "TG16": {
                    "importe": 25.56,
                    "comision": 5.24
                },
            }
        except Exception as e:
            print(f"Error consultando artículos sin comisión: {str(e)}")
            return []

    async def consultar_articulos_comisionables(self, materiales: List[Dict[str, float]]) -> Dict[str, Dict[str, float]]:
        """
        Consulta si los artículos son comisionables y calcula la comisión del 5% sobre el importe.
        Retorna un diccionario con el importe original y el importe de la comisión.
        """
        articulos_sin_comision = await self.consultar_articulos_sin_comision()
        return articulos_sin_comision