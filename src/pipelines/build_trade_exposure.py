import pandas as pd

from src.db import get_conn


def estimate_import_dependency():
    conn = get_conn()

    companies = conn.execute(
        """
        SELECT ticker, sector, sub_industry
        FROM project_universe
        """
    ).fetchdf()

    records = []

    for _, row in companies.iterrows():
        ticker = row["ticker"]
        sector = str(row["sector"])
        sub_industry = str(row["sub_industry"])

        exposure = 0.30

        # More targeted placeholder logic for the project universe
        if "Technology Hardware" in sub_industry or "Semiconductors" in sub_industry:
            exposure = 0.75
        elif "Computer & Electronics Retail" in sub_industry:
            exposure = 0.70
        elif "Technology Distributors" in sub_industry:
            exposure = 0.65
        elif "Broadline Retail" in sub_industry:
            exposure = 0.60
        elif "Automotive Parts" in sub_industry:
            exposure = 0.70
        elif "Construction Machinery" in sub_industry:
            exposure = 0.65
        elif "Building Products" in sub_industry:
            exposure = 0.55
        elif "Household" in sub_industry or "Personal Care" in sub_industry:
            exposure = 0.50
        elif "Apparel" in sub_industry or "Footwear" in sub_industry:
            exposure = 0.80
        elif "Application Software" in sub_industry:
            exposure = 0.20
        elif "Industrial Conglomerates" in sub_industry:
            exposure = 0.60
        elif "Industrials" in sector:
            exposure = 0.55
        elif "Information Technology" in sector:
            exposure = 0.50
        elif "Consumer Discretionary" in sector:
            exposure = 0.60
        elif "Consumer Staples" in sector:
            exposure = 0.45

        records.append(
            {
                "ticker": ticker,
                "import_dependency_ratio": exposure,
            }
        )

    df = pd.DataFrame(records)

    conn.execute("DROP TABLE IF EXISTS trade_exposure")

    conn.execute(
        """
        CREATE TABLE trade_exposure AS
        SELECT * FROM df
        """
    )

    print("Saved trade_exposure table")


if __name__ == "__main__":
    estimate_import_dependency()