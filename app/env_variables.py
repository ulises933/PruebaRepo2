import os
from datetime import datetime, date
from dotenv import load_dotenv

load_dotenv()

DB_HOST = os.getenv('DB_HOST')
DB_PORT = os.getenv('DB_PORT')
DB_USER = os.getenv('DB_USER')
DB_PASS = os.getenv('DB_PASS')

TRINO_HOST = os.getenv('TRINO_HOST')
TRINO_PORT = os.getenv('TRINO_PORT')
TRINO_USER = os.getenv('TRINO_USER')
TRINO_PASS = os.getenv('TRINO_PASS')

LOGGING_NAME = os.getenv('LOGGING_NAME')

DB_DIR = "data"

SAP_API_KEY = os.getenv('SAP_API_KEY')
SAP_API_URL = os.getenv('SAP_API_URL')

def get_current_month_range():
    today = date.today()
    first_day = date(today.year, today.month, 1)
    if today.month == 12:
        next_month = date(today.year + 1, 1, 1)
    else:
        next_month = date(today.year, today.month + 1, 1)
    
    return {
        "start": first_day.strftime("%Y-%m-%dT00:00:00"),
        "end": next_month.strftime("%Y-%m-%dT00:00:00")
    }
