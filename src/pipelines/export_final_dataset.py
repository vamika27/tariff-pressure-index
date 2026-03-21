import pandas as pd

from src.db import get_conn


def run():
    conn = get_conn()

    universe = conn.execute("""
        SELECT ticker, company_name_x, sector, sub_industry
        FROM project_universe
    """).fetchdf()

    scores = conn.execute("""
        SELECT ticker,
               gross_margin,
               import_dependency_ratio,
               affected_region_revenue_share,
               tariff_pressure_score,
               risk_bucket
        FROM tariff_pressure_index
    """).fetchdf()

    final_df = universe.merge(scores, on="ticker", how="left")

    final_df = final_df.rename(
        columns={
            "company_name_x": "company_name"
        }
    )

    final_df = final_df.sort_values(
        "tariff_pressure_score",
        ascending=False,
        na_position="last"
    )

    final_df.to_csv("data/outputs/final_tariff_pressure_dataset.csv", index=False)

    conn.execute("DROP TABLE IF EXISTS final_tariff_pressure_dataset")
    conn.execute("""
        CREATE TABLE final_tariff_pressure_dataset AS
        SELECT * FROM final_df
    """)

    print("Saved data/outputs/final_tariff_pressure_dataset.csv")
    print("Saved final_tariff_pressure_dataset table")


if __name__ == "__main__":
    run()