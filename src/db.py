import duckdb
from src.config import DUCKDB_PATH


def get_conn():
    return duckdb.connect(DUCKDB_PATH)