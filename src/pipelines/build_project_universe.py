import pandas as pd

from src.db import get_conn


TARGET_TICKERS = [
    "WMT", "TGT", "HD", "LOW",
    "AAPL", "HPQ", "DELL", "CSCO",
    "CAT", "MMM", "DE", "WHR",
    "PG", "CL", "KMB", "NKE",
    "BBY", "CDW", "COST", "AMZN",
    "ADBE", "AMD", "APTV", "BLDR"
]


def run():
    conn = get_conn()

    universe = conn.execute("""
        SELECT *
        FROM company_universe
    """).fetchdf()

    out = universe[universe["ticker"].isin(TARGET_TICKERS)].copy()

    conn.execute("DROP TABLE IF EXISTS project_universe")
    conn.execute("""
        CREATE TABLE project_universe AS
        SELECT * FROM out
    """)

    print(f"Saved project_universe table with {len(out)} companies")
    print(out[["ticker", "company_name_x", "sector", "sub_industry"]].head(10))


if __name__ == "__main__":
    run()