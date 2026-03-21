import pandas as pd

from src.db import get_conn
from src.data_sources.sec_client import get_company_financials_from_sec


def run():
    conn = get_conn()

    companies = conn.execute(
        """
        SELECT ticker, cik
        FROM project_universe
        """
    ).fetchdf()

    records = []

    for _, row in companies.iterrows():
        ticker = row["ticker"]
        cik = row["cik"]

        try:
            fin = get_company_financials_from_sec(cik)

            records.append(
                {
                    "ticker": ticker,
                    "cik": cik,
                    "revenue": fin["revenue"],
                    "gross_profit": fin["gross_profit"],
                    "gross_margin": fin["gross_margin"],
                }
            )

            print(f"Processed financials for {ticker}")

        except Exception as e:
            records.append(
                {
                    "ticker": ticker,
                    "cik": cik,
                    "revenue": None,
                    "gross_profit": None,
                    "gross_margin": None,
                    "error": str(e),
                }
            )

            print(f"Failed financials for {ticker}: {e}")

    out = pd.DataFrame(records)

    conn.execute("DROP TABLE IF EXISTS financials")

    conn.execute(
        """
        CREATE TABLE financials AS
        SELECT * FROM out
        """
    )

    print("Saved financials table")


if __name__ == "__main__":
    run()