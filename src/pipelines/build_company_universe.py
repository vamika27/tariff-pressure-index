import pandas as pd

from src.data_sources.universe_loader import get_sp500_companies
from src.data_sources.sec_client import get_sec_ticker_map
from src.db import get_conn


def build_company_universe():

    print("Loading S&P 500 companies...")
    sp500 = get_sp500_companies()

    print("Loading SEC ticker map...")
    sec_map = get_sec_ticker_map()

    print("Joining datasets...")
    df = sp500.merge(sec_map, on="ticker", how="left")

    missing = df["cik"].isna().sum()

    print(f"Companies missing CIK: {missing}")

    conn = get_conn()

    conn.execute("DROP TABLE IF EXISTS company_universe")

    conn.execute(
        """
        CREATE TABLE company_universe AS
        SELECT * FROM df
        """
    )

    print("Saved company_universe table")

    return df


if __name__ == "__main__":
    df = build_company_universe()
    print(df.head())