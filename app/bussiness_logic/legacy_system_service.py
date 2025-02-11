import asyncio
from typing import List, Dict

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
        pass
    
    async def consultar_articulos_comisionables(self, materiales: List[str]) -> Dict[str, bool]:
        """Consulta si los artículos son comisionables en el sistema legado"""
        resultados = {}
        for material in materiales:
            resultados[material] = self.MOCK_ARTICULOS_LEGADO.get(material, False)
        
        await asyncio.sleep(0.5)
        return resultados 