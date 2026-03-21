import pandas as pd

from src.db import get_conn
from src.parsers.filing_table_parser import extract_geographic_revenue


def run():

    conn = get_conn()

    filings = conn.execute(
        """
        SELECT ticker, file_path
        FROM filings
        """
    ).fetchdf()

    records = []

    for _, row in filings.iterrows():

        ticker = row["ticker"]
        file_path = row["file_path"]

        try:

            df = extract_geographic_revenue(file_path)

            for _, r in df.iterrows():

                records.append(
                    {
                        "ticker": ticker,
                        "region": r["region"],
                        "value": r["value"],
                    }
                )

            print(f"Parsed {ticker}")

        except Exception as e:

            print(f"Failed {ticker}: {e}")

    out = pd.DataFrame(records)

    conn.execute("DROP TABLE IF EXISTS geographic_revenue")

    conn.execute(
        """
        CREATE TABLE geographic_revenue AS
        SELECT * FROM out
        """
    )

    print("Saved geographic_revenue table")


if __name__ == "__main__":
    run()