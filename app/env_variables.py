import os
from datetime import datetime, date
from dotenv import load_dotenv

load_dotenv()

DB_HOST = os.getenv('DB_HOST')
DB_PORT = os.getenv('DB_PORT')
DB_USER = os.getenv('DB_USER')
DB_PASS = os.getenv('DB_PASS')

TRINO_HOST = os.getenv('TRINO_HOST', 'localhost')
TRINO_PORT = os.getenv('TRINO_PORT', '8080')
TRINO_USER = os.getenv('TRINO_USER', 'admin')
TRINO_CATALOG = os.getenv('TRINO_CATALOG')
TRINO_CATALOG_TICENTRAL = os.getenv('TRINO_CATALOG_TICENTRAL')
LOGGING_NAME = os.getenv('LOGGING_NAME')

DB_DIR = "data"

SAP_API_KEY = os.getenv('SAP_API_KEY')
SAP_API_URL = os.getenv('SAP_API_URL')
HIERARCHY_API_URL = os.getenv('HIERARCHY_API_URL')
ITEM_API_URL = os.getenv('ITEM_API_URL')

SAP_ODATA_URL = os.getenv('SAP_ODATA_URL')
SAP_ODATA_CLIENT_ID = os.getenv('SAP_ODATA_CLIENT_ID')
SAP_ODATA_CLIENT_SECRET = os.getenv('SAP_ODATA_CLIENT_SECRET')
