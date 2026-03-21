from pathlib import Path
from dotenv import load_dotenv
import os

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

CONFIG_DIR = BASE_DIR / "config"

DATA_DIR = BASE_DIR / "data"
RAW_DIR = DATA_DIR / "raw"
DERIVED_DIR = DATA_DIR / "derived"
PROCESSED_DIR = DATA_DIR / "processed"
OUTPUT_DIR = DATA_DIR / "outputs"

SEC_CACHE_DIR = RAW_DIR / "sec_cache"
MARKET_CACHE_DIR = RAW_DIR / "market_cache"
CENSUS_DIR = RAW_DIR / "census"

for folder in [
    CONFIG_DIR,
    RAW_DIR,
    DERIVED_DIR,
    PROCESSED_DIR,
    OUTPUT_DIR,
    SEC_CACHE_DIR,
    MARKET_CACHE_DIR,
    CENSUS_DIR,
]:
    folder.mkdir(parents=True, exist_ok=True)

SEC_USER_AGENT = os.getenv("SEC_USER_AGENT", "TariffPressureIndex contact@example.com")
DUCKDB_PATH = str(BASE_DIR / "tariff_pressure.duckdb")