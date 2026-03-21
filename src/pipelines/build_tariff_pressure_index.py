import pandas as pd

from src.db import get_conn
from src.scoring import build_tariff_pressure_score


AFFECTED_REGIONS = {"China", "Asia", "Japan", "Europe", "Americas"}


def clean_geo_value(x):
    val = pd.to_numeric(x, errors="coerce")

    if pd.isna(val):
        return None

    if val < 0:
        return None

    if 0 <= val <= 100:
        return float(val)

    return None


def run():
    conn = get_conn()

    geo = conn.execute(
        """
        SELECT ticker, region, value
        FROM geographic_revenue
        """
    ).fetchdf()

    trade = conn.execute(
        """
        SELECT ticker, import_dependency_ratio
        FROM trade_exposure
        """
    ).fetchdf()

    fin = conn.execute(
        """
        SELECT ticker, gross_margin, revenue
        FROM financials
        """
    ).fetchdf()

    geo = geo[geo["region"].isin(AFFECTED_REGIONS)].copy()
    geo["clean_value"] = geo["value"].apply(clean_geo_value)

    geo_summary = (
        geo.groupby("ticker", as_index=False)["clean_value"]
        .max()
        .rename(columns={"clean_value": "affected_region_revenue_share"})
    )

    geo_summary["affected_region_revenue_share"] = geo_summary[
        "affected_region_revenue_share"
    ].fillna(0)

    master = trade.merge(fin, on="ticker", how="left").merge(
        geo_summary, on="ticker", how="left"
    )

    master["affected_region_revenue_share"] = master[
        "affected_region_revenue_share"
    ].fillna(0)

    # Fill missing gross margins with median so score is always computable
    median_gross_margin = master["gross_margin"].median(skipna=True)
    master["gross_margin"] = master["gross_margin"].fillna(median_gross_margin)

    scored = build_tariff_pressure_score(master)

    conn.execute("DROP TABLE IF EXISTS tariff_pressure_index")

    conn.execute(
        """
        CREATE TABLE tariff_pressure_index AS
        SELECT * FROM scored
        """
    )

    scored.to_csv("data/outputs/tariff_pressure_index.csv", index=False)

    print("Saved tariff_pressure_index table")
    print("Saved data/outputs/tariff_pressure_index.csv")


if __name__ == "__main__":
    run()